import {useState} from 'react';
import VirtualGridList from '@enact/sandstone/VirtualList';
import ImageItem from '@enact/sandstone/ImageItem';

// 샘플 재생목록들
const playlistData = [
  {id: 'drama', title: '드라마 모음', thumbnail: 'https://picsum.photos/seed/drama/300/300'},
  {id: 'variety', title: '예능 모음', thumbnail: 'https://picsum.photos/seed/variety/300/300'}
];

// 각 재생목록별 영상들
const videosByPlaylist = {
  drama: [
    {id: 1, title: '드라마1', src: 'https://media.w3.org/2010/05/sintel/trailer.mp4'},
    {id: 2, title: '드라마2', src: 'https://media.w3.org/2010/05/sintel/trailer.mp4'}
  ],
  variety: [
    {id: 3, title: '예능1', src: 'https://media.w3.org/2010/05/sintel/trailer.mp4'},
    {id: 4, title: '예능2', src: 'https://media.w3.org/2010/05/sintel/trailer.mp4'}
  ]
};

const Playlist = ({onVideoSelect}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const showLists = !selectedPlaylist;

  const renderPlaylist = ({index, ...rest}) => {
    const item = playlistData[index];
    return (
      <ImageItem
        {...rest}
        src={item.thumbnail}
        label={item.title}
        orientation="vertical"
        // eslint-disable-next-line
        onClick={() => setSelectedPlaylist(item.id)}
        style={{height: '12rem', width: '14rem'}}
      >
        {item.title}
      </ImageItem>
    );
  };

  const renderVideos = ({index, ...rest}) => {
    const videos = videosByPlaylist[selectedPlaylist] || [];

    // 첫 칸은 뒤로가기 버튼
    if (index === 0) {
      return (
        <ImageItem
          {...rest}
          label="← 목록으로"
          orientation="vertical"
          // eslint-disable-next-line
          onClick={() => setSelectedPlaylist(null)}
          style={{height: '12rem', width: '14rem'}}
        >
          뒤로가기
        </ImageItem>
      );
    }

    const video = videos[index - 1];
    return (
      <ImageItem
        {...rest}
        src={`https://picsum.photos/seed/${video.id}/300/300`}
        label={video.title}
        orientation="vertical"
        // eslint-disable-next-line
        onClick={() => onVideoSelect(video.src)}
        style={{height: '12rem', width: '14rem'}}
      >
        {video.title}
      </ImageItem>
    );
  };

  return (
    <VirtualGridList
      dataSize={showLists ? playlistData.length : videosByPlaylist[selectedPlaylist].length + 1}
      itemRenderer={showLists ? renderPlaylist : renderVideos}
      itemSize={{minWidth: 400, minHeight: 294}}
      spacing={24}
      direction="vertical"
      scrollMode="native"
    />
  );
};

export default Playlist;
