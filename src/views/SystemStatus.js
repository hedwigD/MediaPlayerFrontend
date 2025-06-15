import { useState, useEffect, useRef } from 'react';
import { getProcStat, getUnitList } from '../libs/services';
import debugLog from '../libs/log';
import ReactECharts from 'echarts-for-react';

const SystemStatus = () => {
  const cpuRef = useRef(null);
  const memRef = useRef(null);
  const [cpuUsage, setCpuUsage] = useState([]);
  const [memoryUsage, setMemoryUsage] = useState([]);
  const [memoryData, setMemoryData] = useState([]); // 실시간 메모리 사용량 기록
  const [timeStamps, setTimeStamps] = useState([]); // 시간 기록

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

          // 실시간 메모리 사용량 데이터 업데이트
          setMemoryData(prevData => [...prevData, res.usable_memory]);
          setTimeStamps(prevTimes => [...prevTimes, new Date().toLocaleTimeString()]);
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

  // CPU Pie Chart rendering with percentage
  const renderCPUPie = () => {
    const core = cpuUsage[0];  // 첫 번째 CPU 코어만 사용
    const cpuCount = cpuUsage.length; // CPU 개수

    return (
      <div style={{ width: '45%', margin: '15px 10px', backgroundColor: '#1b1b1b', borderRadius: '10px' }}>
        <h4 style={{ color: '#fff', padding: '10px 0', textAlign: 'center' }}>
          {`CPU (총 ${cpuCount}개)`}  {/* CPU 개수 표시 */}
        </h4>
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
                label: {
                  show: true,
                  formatter: '{b}: {c} ({d}%)', // 퍼센트 표시
                  fontSize: 14
                },
                emphasis: {
                  label: { show: true, fontSize: 14, fontWeight: 'bold' }
                },
                labelLine: { show: false },
                data: core.data
              }
            ]
          }}
          style={{ height: 220 }}
        />
      </div>
    );
  };

  // Memory Line Chart rendering with real-time usage
  const renderMemoryLineChart = () => (
    <ReactECharts
      option={{
        backgroundColor: 'transparent',
        xAxis: {
          type: 'category',
          data: timeStamps, // 시간 기록
          axisLabel: { color: '#ccc' }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#ccc' }
        },
        tooltip: { trigger: 'axis' },
        series: [
          {
            data: memoryData, // 실시간 메모리 사용량
            type: 'line',
            itemStyle: { color: '#47b39c' },
            lineStyle: { width: 3 },
            symbol: 'circle', // 점을 원으로 설정
            smooth: true
          }
        ]
      }}
      style={{ height: 350 }}
    />
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        overflowY: 'auto',
        maxHeight: '80vh',
        padding: '20px',
        backgroundColor: '#111',
        color: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div>
        <h3 style={{ color: '#E50914', fontSize: '24px', textAlign: 'center' }}>CPU Status</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>{renderCPUPie()}</div>
      </div>

      <div>
        <h3 style={{ color: '#E50914', fontSize: '24px', textAlign: 'center' }}>Memory Usage (Real-time)</h3>
        {renderMemoryLineChart()}
      </div>
    </div>
  );
};

export default SystemStatus;
