import { useState, useEffect, useRef } from 'react';
import { getProcStat, getUnitList } from '../libs/services';
import debugLog from '../libs/log';
import ReactECharts from 'echarts-for-react';

const SystemStatus = () => {
	const cpuRef = useRef(null);
	const memRef = useRef(null);
	const [cpuUsage, setCpuUsage] = useState([]);
	const [memoryUsage, setMemoryUsage] = useState([]);

	useEffect(() => {
		if (!cpuRef.current) {
			cpuRef.current = getProcStat({
				parameters: { subscribe: true },
				onSuccess: res => {
					debugLog('CPU_STATS[S]', res);
					const cpuStats = res.stat.slice(0, 5).map(line => {
						const parts = line.split(/\s+/);
						return {
							name: parts[0], // e.g., cpu0
							data: [
								{ name: 'User', value: parseInt(parts[1]) },
								{ name: 'Nice', value: parseInt(parts[2]) },
								{ name: 'System', value: parseInt(parts[3]) },
								{ name: 'Idle', value: parseInt(parts[4]) }
							]
						};
					});
					setCpuUsage(cpuStats);
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

	const renderCPUPies = () =>
		cpuUsage.map((core, idx) => (
			<div key={idx} style={{ width: '45%', margin: '10px' }}>
				<h4 style={{ color: '#ccc' }}>{core.name}</h4>
				<ReactECharts
					option={{
						backgroundColor: 'transparent',
						tooltip: { trigger: 'item' },
						series: [
							{
								type: 'pie',
								radius: ['30%', '70%'],
								avoidLabelOverlap: false,
								itemStyle: { borderRadius: 5, borderColor: '#000', borderWidth: 1 },
								label: { show: false },
								emphasis: {
									label: { show: true, fontSize: 14, fontWeight: 'bold' }
								},
								labelLine: { show: false },
								data: core.data
							}
						]
					}}
					style={{ height: 200 }}
				/>
			</div>
		));

	const renderMemoryBar = () => (
		<ReactECharts
			option={{
				backgroundColor: 'transparent',
				xAxis: {
					type: 'category',
					data: memoryUsage.map(d => d.name),
					axisLabel: { color: '#ccc' }
				},
				yAxis: {
					type: 'value',
					axisLabel: { color: '#ccc' }
				},
				tooltip: { trigger: 'axis' },
				series: [
					{
						data: memoryUsage.map(d => d.value),
						type: 'bar',
						itemStyle: { color: '#47b39c' },
						barWidth: '40%'
					}
				]
			}}
			style={{ height: 300 }}
		/>
	);

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
				<div style={{ display: 'flex', flexWrap: 'wrap' }}>{renderCPUPies()}</div>
			</div>

			<div>
				<h3 style={{ color: '#E50914' }}>Memory Status</h3>
				{renderMemoryBar()}
			</div>
		</div>
	);
};

export default SystemStatus;
