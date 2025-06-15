// src/views/Playlist.js
import React, { useState, useEffect } from 'react';
import VirtualGridList from '@enact/sandstone/VirtualList';
import ImageItem from '@enact/sandstone/ImageItem';
import Popup from '@enact/sandstone/Popup';
import Input from '@enact/sandstone/Input';
import Button from '@enact/sandstone/Button';
import axios from 'axios';

const API_ROOT = 'http://15.165.123.189:8080';

const Playlist = ({ token, onVideoSelect }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistIdx, setIndex] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // 내 + 공개 재생목록 조회
  useEffect(() => {
    console.log('[Playlist] fetching playlists with token:', token);
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API_ROOT}/playlists/my`, { headers }),
      axios.get(`${API_ROOT}/playlists/public`, { headers }),
    ])
      .then(([my, pub]) => {
        console.log('[Playlist] responses:', my.data, pub.data);
        const myList = my.data.isSuccess ? my.data.result : [];
        const pubList = pub.data.isSuccess ? pub.data.result : [];
        const merged = [...myList, ...pubList].reduce((acc, p) => {
          if (!acc.some(x => x.playlistId === p.playlistId)) acc.push(p);
          return acc;
        }, []);
        setPlaylists(merged);
      })
      .catch(err => {
        console.error('[Playlist] fetch error:', err);
        setPlaylists([]);
      });
  }, [token]);

  // 재생목록 생성
  const handleCreate = () => {
    if (!newTitle) {
      console.warn('[Playlist] 제목이 비어있습니다.');
      return;
    }

    axios
      .post(
        `${API_ROOT}/playlists`,
        {
          title: newTitle,
          status: 'PUBLIC', // 필수 필드 추가됨
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then(res => {
        console.log('[Playlist] 생성 성공:', res.data);
        setShowDialog(false);
        setNewTitle('');
        setIndex(null);

        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
          axios.get(`${API_ROOT}/playlists/my`, { headers }),
          axios.get(`${API_ROOT}/playlists/public`, { headers }),
        ]).then(([my, pub]) => {
          const myList = my.data.isSuccess ? my.data.result : [];
          const pubList = pub.data.isSuccess ? pub.data.result : [];
          const merged = [...myList, ...pubList].reduce((acc, p) => {
            if (!acc.some(x => x.playlistId === p.playlistId)) acc.push(p);
            return acc;
          }, []);
          setPlaylists(merged);
        });
      })
      .catch(err => {
        console.error('[Playlist] 생성 실패:', err.response || err);
        setShowDialog(false);
      });
  };

  const renderItem = ({ index, ...rest }) => {
    // 선택 전 (재생목록 목록)
    if (selectedPlaylistIdx == null) {
      if (index === 0) {
        return (
          <ImageItem
            {...rest}
            orientation="vertical"
            label="+ 새 재생목록"
            style={{ height: '12rem', width: '14rem' }}
            onClick={() => setShowDialog(true)}
          >
            새 재생목록
          </ImageItem>
        );
      }
      const playlist = playlists[index - 1];
      return playlist ? (
        <ImageItem
          {...rest}
          orientation="vertical"
          label={playlist.title}
          style={{ height: '12rem', width: '14rem' }}
          onClick={() => setIndex(index - 1)}
        >
          {playlist.title}
        </ImageItem>
      ) : null;
    }

    // 선택 후 (재생목록 내부 영상들)
    if (index === 0) {
      return (
        <ImageItem
          {...rest}
          orientation="vertical"
          label="◀ 재생목록으로 돌아가기"
          style={{ height: '12rem', width: '14rem' }}
          onClick={() => setIndex(null)}
        >
          뒤로
        </ImageItem>
      );
    }
    const video =
      playlists[selectedPlaylistIdx]?.videoDetailList[index - 1];
    return video ? (
      <ImageItem
        {...rest}
        orientation="vertical"
        src={{
          fhd: video.thumbnailUrl,
          hd: video.thumbnailUrl,
          uhd: video.sourceUrl,
        }}
        label={video.title}
        style={{ height: '12rem', width: '14rem' }}
        onClick={() => onVideoSelect(video.videoId)}
      >
        {video.title}
      </ImageItem>
    ) : null;
  };

  const dataSize =
    selectedPlaylistIdx == null
      ? playlists.length + 1
      : (playlists[selectedPlaylistIdx]?.videoDetailList.length || 0) + 1;

  return (
    <>
      <VirtualGridList
        dataSize={dataSize}
        itemRenderer={renderItem}
        itemSize={{ minWidth: 400, minHeight: 294 }}
        spacing={24}
        direction="vertical"
        scrollMode="native"
        spotlightDisabled={showDialog}
      />

      <Popup
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="새 재생목록 생성"
        spotlightRestrict="self-first"
        noAutoDismiss
        scrimType="transparent"
      >
        <Input
          placeholder="재생목록 이름"
          value={newTitle}
          onChange={ev => setNewTitle(ev.value)}
        />
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <Button onClick={handleCreate} disabled={!newTitle}>
            생성
          </Button>
          <Button onClick={() => setShowDialog(false)}>취소</Button>
        </div>
      </Popup>
    </>
  );
};

export default Playlist;
