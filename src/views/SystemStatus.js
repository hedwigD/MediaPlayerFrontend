import { useState, useEffect, useRef } from 'react';
import { getProcStat, getUnitList } from '../libs/services';
import debugLog from '../libs/log';
import ReactECharts from 'echarts-for-react';

const SystemStatus = () => {
	const cpuRef = useRef(null);
	const memRef = useRef(null);
	const [cpuUsage, setCpuUsage] = useState({});
	const [memoryUsage, setMemoryUsage] = useState([]);

	useEffect(() => {
		if (!cpuRef.current) {
			cpuRef.current = getProcStat({
				parameters: { subscribe: true },
				onSuccess: res => {
					debugLog('CPU_STATS[S]', res);

					const parts = res.stat[0].split(/\s+/); // 'cpu' line only
					const cpuData = {
						name: parts[0],
						coreCount: res.stat.length - 1, // cpu0 ~ cpuN
						data: [
							{ name: 'User', value: parseInt(parts[1]) },
							{ name: 'Nice', value: parseInt(parts[2]) },
							{ name: 'System', value: parseInt(parts[3]) },
							{ name: 'Idle', value: parseInt(parts[4]) }
						]
					};

					setCpuUsage(cpuData);
				},
				onFailure: err => debugLog('CPU_STATS[F]', err)
			});
		}

		if (!memRef.current) {
			memRef.current = getUnitList({
				parameters: { subscribe: true },
				onSuccess: res => {
					debugLog('MEMORY_STATS[S]', res);
					setMemoryUsage([
						{ name: 'Usable Memory', value: res.usable_memory },
						{ name: 'Swap Used', value: res.swapUsed }
					]);
				},
				onFailure: err => debugLog('MEMORY_STATS[F]', err)
			});
		}

		return () => {
			if (cpuRef.current) {
				cpuRef.current.cancel();
				cpuRef.current = null;
			}
			if (memRef.current) {
				memRef.current.cancel();
				memRef.current = null;
			}
		};
	}, []);

	const renderCPUPie = () => {
		if (!cpuUsage.data) return null;

		return (
			<div style={{ width: '100%', margin: '10px' }}>
				<h4 style={{ color: '#ccc' }}>
					{cpuUsage.name.toUpperCase()} (총 {cpuUsage.coreCount}코어)
				</h4>
				<ReactECharts
					option={{
						backgroundColor: 'transparent',
						tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
						series: [
							{
								type: 'pie',
								radius: ['30%', '70%'],
								avoidLabelOverlap: false,
								itemStyle: {
									borderRadius: 5,
									borderColor: '#000',
									borderWidth: 1
								},
								label: {
									show: true,
									formatter: '{b}: {d}%',
									color: '#fff',
									fontSize: 12
								},
								emphasis: {
									label: {
										show: true,
										fontSize: 14,
										fontWeight: 'bold'
									}
								},
								labelLine: { show: true },
								data: cpuUsage.data
							}
						]
					}}
					style={{ height: 250 }}
				/>
			</div>
		);
	};

	const renderMemoryBars = () => {
		if (!memoryUsage.length) return null;

		const getBarOption = (title, value, color) => ({
			backgroundColor: 'transparent',
			xAxis: {
				type: 'category',
				data: [title],
				axisLabel: { color: '#ccc' }
			},
			yAxis: {
				type: 'value',
				axisLabel: { color: '#ccc' }
			},
			tooltip: {
				trigger: 'axis',
				formatter: `${title}: {c}`
			},
			series: [
				{
					data: [value],
					type: 'bar',
					itemStyle: { color },
					barWidth: '50%'
				}
			]
		});

		const usable = memoryUsage.find(m => m.name === 'Usable Memory');
		const swap = memoryUsage.find(m => m.name === 'Swap Used');

		return (
			<>
				{usable && (
					<div>
						<h4 style={{ color: '#ccc' }}>Usable Memory</h4>
						<ReactECharts
							option={getBarOption('Usable Memory', usable.value, '#47b39c')}
							style={{ height: 250 }}
						/>
					</div>
				)}
				{swap && (
					<div>
						<h4 style={{ color: '#ccc' }}>Swap Used</h4>
						<ReactECharts
							option={getBarOption('Swap Used', swap.value, '#ffc154')}
							style={{ height: 250 }}
						/>
					</div>
				)}
			</>
		);
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '20px',
				overflowY: 'auto',
				maxHeight: '80vh',
				padding: '10px',
				backgroundColor: '#000',
				color: '#fff'
			}}
		>
			<div>
				<h3 style={{ color: '#E50914' }}>CPU Status</h3>
				{renderCPUPie()}
			</div>

			<div>
				<h3 style={{ color: '#E50914' }}>Memory Status</h3>
				{renderMemoryBars()}
			</div>
		</div>
	);
};

export default SystemStatus;
