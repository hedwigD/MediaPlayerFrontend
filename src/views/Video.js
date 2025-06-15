import React, {useRef, useEffect, useState} from 'react';
import VideoPlayer from '@enact/sandstone/VideoPlayer';
import {MediaControls} from '@enact/sandstone/MediaPlayer';
import Button from '@enact/sandstone/Button';
import Alert from '@enact/sandstone/Alert';
import CommentSection from './CommentSection';
import axios from 'axios';

const API_ROOT = 'http://15.165.123.189:8080';

const formatTimestamp = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const getCurrentTimeSafely = () => {
  const videoElement = document.querySelector('video');
  if (!videoElement || typeof videoElement.currentTime !== 'number') return null;
  return Math.floor(videoElement.currentTime);
};

const Video = ({src, timestamp = 0, videoId = 0, onViewSummary, onBackToHome, token}) => {
  const videoRef = useRef(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [hasSeeked, setHasSeeked] = useState(false);

  const fallbackSrc = '/sample.mp4';
  const resolvedSrc = src || fallbackSrc;

  useEffect(() => {
    const video = document.querySelector('video');
    if (!video || !resolvedSrc) return;

    const seekSeconds = typeof timestamp === 'number' ? timestamp : 0;

    const handleLoadedMetadata = () => {
      console.log('[Video] loadedmetadata fired');
      console.log('[Video] 서버로부터 받은 timestamp:', timestamp, '→', seekSeconds, '초');
      if (!hasSeeked && seekSeconds > 0) {
        video.currentTime = seekSeconds;
        console.log('[Video] currentTime 설정됨:', seekSeconds);
        setHasSeeked(true);
      }
    };

    const handleCanPlay = () => {
      console.log('[Video] canplay fired');
      video.play().catch((err) => {
        if (err.name !== 'AbortError') console.error('[Video] 재생 실패', err);
      });
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [resolvedSrc, timestamp, hasSeeked]);

  useEffect(() => {
    const video = document.querySelector('video');
    if (!video) return;
    showComments ? video.pause() : video.play();
  }, [showComments]);

  const saveResumePoint = async () => {
    const seconds = getCurrentTimeSafely();
    if (seconds == null) {
      console.error('[Video] 현재 시점 추출 실패');
      return false;
    }
    const timestampStr = formatTimestamp(seconds);
    try {
      console.log('[Video] 저장할 timestamp:', timestampStr);
      await axios.post(`${API_ROOT}/videos/${videoId}/resume-point?timestamp=${timestampStr}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (err) {
      console.error('[Video] 시점 저장 실패', err);
      return false;
    }
  };

  const handleSummary = () => {
    saveResumePoint().then((ok) => {
      if (ok && typeof onViewSummary === 'function') {
        onViewSummary(videoId);
      }
    });
  };

  const handleBackToHome = () => {
    saveResumePoint().then((ok) => {
      if (ok && typeof onBackToHome === 'function') {
        onBackToHome();
      }
    });
  };

  const handleCapture = async () => {
    const videoElement = document.querySelector('video');
    if (!videoElement || videoElement.readyState < 2) {
      console.error('[Capture] video 요소가 없거나 준비되지 않음');
      return;
    }

    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 300);

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    try {
      await axios.post(`${API_ROOT}/${videoId}/capture?comment=자동캡처`, dataUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        }
      });
    } catch (e) {
      console.error('서버 전송 실패', e);
    }
  };

  const handleAddToPlaylist = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/playlists/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(res.data.result || []);
      setShowPlaylistPopup(true);
    } catch (e) {
      console.error('재생목록 로드 실패', e);
      setPlaylists([]);
      setShowPlaylistPopup(true);
    }
  };

  const handleSelectPlaylist = async (playlistId) => {
    try {
      await axios.post(
        `${API_ROOT}/playlists/${playlistId}/videos/${videoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPlaylistPopup(false);
      setShowAlert(true);
    } catch (e) {
      console.error('재생목록 추가 실패', e);
    }
  };

  const toggleComments = () => setShowComments(prev => !prev);

  return (
    <div style={{position: 'relative', width: '90vw', margin: '0 auto'}}>
      <div style={{position: 'absolute', top: 10, right: 10, zIndex: 15, display: 'flex', gap: '1rem'}}>
        <Button onClick={handleCapture}>캡처</Button>
        <Button onClick={handleSummary}>요약본 보기</Button>
        <Button onClick={handleAddToPlaylist}>재생목록에 추가</Button>
        <Button onClick={toggleComments}>{showComments ? '닫기' : '댓글'}</Button>
        <Button onClick={handleBackToHome}>홈으로</Button>
      </div>

      <div style={{
        flex: 1,
        minHeight: '35rem',
        maxWidth: '100%',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: isBlinking ? '0 0 20px 4px white' : 'none',
        transition: 'box-shadow 0.2s ease-in-out',
        zIndex: 10,
        backgroundColor: 'black',
        position: 'relative'
      }}>
        <VideoPlayer
          ref={videoRef}
          style={{width: '100%', height: '100%'}}
          autoCloseTimeout={7000}
          loop
          title="재생 중인 영상"
        >
          <source src={resolvedSrc} type="video/mp4" />
          <infoComponents>영상 정보 placeholder</infoComponents>
          <MediaControls />
        </VideoPlayer>

        {showComments && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 20,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div style={{
              width: '80%', height: '80%', backgroundColor: '#1a1a1a',
              padding: '2rem', color: 'white', borderRadius: '1rem', overflowY: 'auto'
            }}>
              <CommentSection videoId={videoId} />
            </div>
          </div>
        )}

        {showPlaylistPopup && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 20,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div style={{
              width: '80%', height: '80%', backgroundColor: '#222',
              padding: '2rem', color: 'white', borderRadius: '1rem', overflowY: 'auto'
            }}>
              <h3>재생목록 선택</h3>
              {playlists.length === 0 ? (
                <div style={{margin: '1rem 0'}}>재생목록이 없습니다.</div>
              ) : (
                playlists.map(p => (
                  <div key={p.playlistId} style={{marginBottom: '1rem'}}>
                    <Button onClick={() => handleSelectPlaylist(p.playlistId)}>
                      {p.title}
                    </Button>
                  </div>
                ))
              )}
              <Button onClick={() => setShowPlaylistPopup(false)}>닫기</Button>
            </div>
          </div>
        )}
      </div>

      <Alert open={showAlert} onClose={() => setShowAlert(false)}>
        재생목록에 추가되었습니다.
      </Alert>
    </div>
  );
};

export default Video;
