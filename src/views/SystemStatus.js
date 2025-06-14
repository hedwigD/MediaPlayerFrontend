// src/pages/SystemStatusPage.js
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Panel, Header } from '@enact/sandstone/Panels';
import Heading from '@enact/sandstone/Heading';
import './systemstatus.css';

function SystemStatus(props) {
  const cpuChartRef = useRef(null);
  const memChartRef = useRef(null);
  const [cpuData, setCpuData] = useState([]);
  const [memoryInfo, setMemoryInfo] = useState({ total: 0, used: 0 });

  const fetchCpuLoad = () => {
    window.webOS?.service?.request('luna://com.webos.service.tv.systemmonitor', {
      method: 'getCpuLoad',
      parameters: {},
      onSuccess: (res) => {
        const time = new Date().toLocaleTimeString();
        const usage = parseFloat((res.load * 100).toFixed(2));
        setCpuData(prev => {
          const updated = [...prev, { time, usage }];
          return updated.length > 20 ? updated.slice(-20) : updated;
        });
      },
      onFailure: (err) => console.error("CPU Error:", err)
    });
  };

  const fetchMemoryStatus = () => {
    window.webOS?.service?.request('luna://com.webos.service.tv.systemmonitor', {
      method: 'getMemoryStatus',
      parameters: {},
      onSuccess: (res) => {
        setMemoryInfo({ total: res.total, used: res.used });
      },
      onFailure: (err) => console.error("Memory Error:", err)
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCpuLoad();
      fetchMemoryStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cpuChart = echarts.init(cpuChartRef.current);
    const cpuOption = {
      title: { text: 'CPU 사용량 (%)' },
      xAxis: { type: 'category', data: cpuData.map(d => d.time), boundaryGap: false },
      yAxis: { type: 'value', max: 100, min: 0 },
      tooltip: { trigger: 'axis' },
      series: [{
        name: 'CPU',
        type: 'line',
        smooth: true,
        data: cpuData.map(d => d.usage),
        areaStyle: {},
        showSymbol: false,
        lineStyle: { width: 2 }
      }]
    };
    cpuChart.setOption(cpuOption);
    return () => cpuChart.dispose();
  }, [cpuData]);

  useEffect(() => {
    const memChart = echarts.init(memChartRef.current);
    const percent = ((memoryInfo.used / memoryInfo.total) * 100).toFixed(1);

    const memOption = {
      title: {
        text: '메모리 사용률',
        left: 'center'
      },
      tooltip: {
        formatter: `{b}: {c}%`
      },
      series: [
        {
          name: 'Memory',
          type: 'pie',
          radius: ['60%', '80%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'center',
            formatter: `${percent}%`,
            fontSize: 24
          },
          data: [
            { value: memoryInfo.used, name: 'Used' },
            { value: memoryInfo.total - memoryInfo.used, name: 'Free' }
          ]
        }
      ]
    };
    memChart.setOption(memOption);
    return () => memChart.dispose();
  }, [memoryInfo]);

  return (
  <Panel {...props} className="system-status-page">
    <Header title={<span className="system-header">시스템 리소스 대시보드</span>} />
    <div className="system-dashboard-container">
      <div className="cpu-chart">
        <Heading className="system-heading" showLine>CPU 실시간 사용량</Heading>
        <div ref={cpuChartRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="memory-chart">
        <Heading className="system-heading" showLine>메모리 사용률</Heading>
        <div ref={memChartRef} style={{ width: '100%', height: '200px' }} />
        <div className="system-text">
          전체: <span className="accent">{(memoryInfo.total / 1024).toFixed(1)} MB</span><br />
          사용 중: <span className="accent">{(memoryInfo.used / 1024).toFixed(1)} MB</span>
        </div>
      </div>
    </div>
  </Panel>
  );
}

export default SystemStatus;
