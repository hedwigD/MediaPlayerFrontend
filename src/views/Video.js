import React, {useRef, useEffect, useState} from 'react';
import VideoPlayer from '@enact/sandstone/VideoPlayer';
import {MediaControls} from '@enact/sandstone/MediaPlayer';
import Button from '@enact/sandstone/Button';
import Alert from '@enact/sandstone/Alert';
import CommentSection from './CommentSection';
import axios from 'axios';

const Video = ({src, timestamp = 0, videoId = 0, onViewSummary}) => {
  const videoRef = useRef(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const fallbackSrc = '/sample.mp4';
  const resolvedSrc = src || fallbackSrc;

  // 초기 timestamp 적용
  useEffect(() => {
    const video = videoRef.current;
    if (video && timestamp > 0) video.currentTime = timestamp;
  }, [timestamp, resolvedSrc]);

  // 댓글 표시 시 일시정지, 닫으면 재생
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    showComments ? video.pause() : video.play();
  }, [showComments]);

  // 캡처 기능
  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video) return;
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 300);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    try {
      await axios.post(`http://localhost:8080/${videoId}/capture?comment=자동캡처`, dataUrl, {headers: {'Content-Type': 'text/plain'}});
    } catch (e) {
      console.error('서버 전송 실패', e);
    }
  };

  // 재생목록 추가 팝업 열기 (실패해도 빈 리스트)
  const handleAddToPlaylist = async () => {
    let data = [];
    try {
      const res = await axios.get(`http://localhost:8080/${videoId}/playlists`);
      data = res.data;
    } catch (e) {
      console.error('재생목록 로드 실패', e);
    }
    setPlaylists(data);
    setShowPlaylistPopup(true);
  };

  // 선택한 재생목록에 영상 추가
  const handleSelectPlaylist = async (playlistId) => {
    try {
      await axios.post(`http://localhost:8080/${videoId}/playlists/${playlistId}`);
      setShowPlaylistPopup(false);
      setShowAlert(true);
    } catch (e) {
      console.error('재생목록 추가 실패', e);
    }
  };

  const toggleComments = () => setShowComments(prev => !prev);

  return (
    <div style={{position: 'relative', width: '90vw', margin: '0 auto'}}>
      {/* 버튼들 */}
      <div style={{position: 'absolute', top: 10, right: 10, zIndex: 15, display: 'flex', gap: '1rem'}}>
        <Button onClick={handleCapture}>캡처</Button>
		<Button onClick={() => onViewSummary(videoId)}>요약본 보기</Button>
		<Button onClick={handleAddToPlaylist}>재생목록에 추가</Button>
        <Button onClick={toggleComments}>{showComments ? '닫기' : '댓글'}</Button>
      </div>

      {/* 비디오 영역 */}
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
          muted
          loop
          title="재생 중인 영상"
        >
          <source src={resolvedSrc} type="video/mp4" />
          <infoComponents>영상 정보 placeholder</infoComponents>
          <MediaControls />
        </VideoPlayer>

        {/* 댓글 오버레이 */}
        {showComments && (
          <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 20, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{width: '80%', height: '80%', backgroundColor: '#1a1a1a', padding: '2rem', color: 'white', borderRadius: '1rem', overflowY: 'auto'}}>
              <CommentSection videoId={videoId} />
            </div>
          </div>
        )}

        {/* 재생목록 팝업 (댓글 메커니즘과 동일한 위치/스타일) */}
        {showPlaylistPopup && (
          <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 20, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{width: '80%', height: '80%', backgroundColor: '#222', padding: '2rem', color: 'white', borderRadius: '1rem', overflowY: 'auto'}}>
              <h3>재생목록 선택</h3>
              {playlists.length === 0 ? (
                <div style={{margin: '1rem 0'}}>재생목록이 없습니다.</div>
              ) : (
                playlists.map(p => (
                  <div key={p.playlistId} style={{marginBottom: '1rem'}}>
                    <Button onClick={() => handleSelectPlaylist(p.playlistId)}>{p.title}</Button>
                  </div>
                ))
              )}
              <Button onClick={() => setShowPlaylistPopup(false)}>닫기</Button>
            </div>
          </div>
        )}
      </div>

      {/* Alert */}
      <Alert open={showAlert} onClose={() => setShowAlert(false)}>
        재생목록에 추가되었습니다.
      </Alert>
    </div>
  );
};

export default Video;
