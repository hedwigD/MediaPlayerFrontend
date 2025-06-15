import React, {useState, useEffect} from 'react';
import VirtualGridList from '@enact/sandstone/VirtualList';
import ImageItem      from '@enact/sandstone/ImageItem';
import axios          from 'axios';

const Home = ({token, onVideoSelect}) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    console.log('[Home] fetching with token:', token);
    axios
      .get(
        'http://15.165.123.189:8080/videos/search',
        {
          headers: { Authorization: `Bearer ${token}` },
          params:  { searchKeyword: '', page: 0 }
        }
      )
      .then(res => {
        console.log('[Home] response:', res.data);
        if (res.data.isSuccess) {
          setVideos(res.data.result.videoDetailResponseDtoList);
        }
      })
      .catch(err => console.error('[Home] error:', err));
  }, [token]);

  const renderItem = ({index, ...rest}) => {
    const item = videos[index];
    if (!item) return null;
    return (
      <ImageItem
        {...rest}
        orientation="vertical"
        src={{
          fhd: item.thumbnailUrl,
          hd:  item.thumbnailUrl,
          uhd: item.sourceUrl
        }}
        label={`조회수 ${item.viewCount}회`}
        style={{height:'12.25rem',width:'15rem'}}
        onClick={() => onVideoSelect(item.videoId)}
      >
        {item.title}
      </ImageItem>
    );
  };

  return (
    <VirtualGridList
      dataSize={videos.length}
      itemRenderer={renderItem}
      itemSize={{minWidth:400,minHeight:294}}
      spacing={24}
      direction="vertical"
      scrollMode="native"
    />
  );
};

export default Home;
