import VirtualGridList from '@enact/sandstone/VirtualList';
import ImageItem from '@enact/sandstone/ImageItem';

const dummyData = new Array(100).fill(null).map((_, i) => ({
  title: `영상 ${i}`,
  label: `조회수 ${Math.floor(Math.random() * 1000)}회`,
  src: {
    fhd: `https://picsum.photos/seed/${i}/300/300`,
    hd: `https://picsum.photos/seed/${i}/200/200`,
    uhd: `https://picsum.photos/seed/${i}/600/600`
  }
}));

const renderItem = ({index, ...rest}) => {
  const item = dummyData[index];
  return (
    <ImageItem
      {...rest}
      orientation="vertical"
      src={item.src}
      label={item.label}
      style={{
        height: '12.25rem',   // 약 294px
        width: '16rem',       // 약 384px
        margin: '1rem'
      }}
    >
      {item.title}
    </ImageItem>
  );
};

const Home = () => {
  return (
    <VirtualGridList
      dataSize={dummyData.length}
      itemRenderer={renderItem}
      itemSize={{
        minWidth: 400,      // 실제 UI 기준으로 맞춰 조정 가능
        minHeight: 294      // 12.25rem = 294px
      }}
      spacing={24}
      direction="vertical"
      scrollMode="native"
    />
  );
};

export default Home;
