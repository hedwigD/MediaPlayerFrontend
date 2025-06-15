import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Panel} from '@enact/sandstone/Panels';
import Scroller from '@enact/sandstone/Scroller';
import Heading from '@enact/sandstone/Heading';
import BodyText from '@enact/sandstone/BodyText';
import axios from 'axios';

const containerStyle = { padding: '1rem' };
const bodyTextStyle = { whiteSpace: 'pre-wrap', marginTop: '1rem' };

const Summary = ({videoId}) => {
  const [summaryText, setSummaryText] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'error', 'ready'

  useEffect(() => {
    let cancelled = false;
    // 영상이 선택되지 않은 경우
    if (videoId == null) {
      setSummaryText(null);
      setStatus('ready');
      return;
    }
    const fetchSummary = async () => {
      setStatus('loading');
      try {
        const {data} = await axios.get(
          `http://localhost:8080/videos/${videoId}/ai/summary`
        );
        if (cancelled) return;
        const text = data.summary?.trim() || null;
        setSummaryText(text);
        setStatus('ready');
      } catch (err) {
        console.error('Summary fetch error', err);
        if (!cancelled) setStatus('error');
      }
    };
    fetchSummary();
    return () => { cancelled = true; };
  }, [videoId]);

  const renderContent = () => {
    if (status === 'loading') {
      return <Heading>요약 로딩 중...</Heading>;
    }
    if (status === 'error') {
      return <BodyText>요약 데이터를 불러오는 데 실패했습니다.</BodyText>;
    }
    // ready 상태
    if (!summaryText) {
      return <BodyText style={bodyTextStyle}>요약 내용이 없습니다.</BodyText>;
    }
    return <BodyText style={bodyTextStyle}>{summaryText}</BodyText>;
  };

  return (
    <Panel>
      <Scroller>
        <div style={containerStyle}>
          <Heading>영상 요약</Heading>
          {renderContent()}
        </div>
      </Scroller>
    </Panel>
  );
};

Summary.propTypes = {
  videoId: PropTypes.number
};

Summary.defaultProps = {
  videoId: null
};

export default Summary;
