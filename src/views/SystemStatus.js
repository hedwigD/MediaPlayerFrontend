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

					// 첫 번째 줄만 사용 ('cpu')
					const parts = res.stat[0].split(/\s+/);
					const cpuData = {
						name: parts[0], // 'cpu'
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

	const renderCPUPies = () => {
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
