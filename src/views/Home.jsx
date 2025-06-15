import React from 'react';
import VirtualGridList from '@enact/sandstone/VirtualList';
import ImageItem from '@enact/sandstone/ImageItem';

const dummyData = new Array(100).fill(null).map((_, i) => ({
	videoId: i,
	title: `영상 ${i}`,
	label: `조회수 ${Math.floor(Math.random() * 10)}회`,
	src: {
		fhd: `https://picsum.photos/seed/${i}/300/300`,
		hd:  `https://picsum.photos/seed/${i}/200/200`,
		uhd: `https://picsum.photos/seed/${i}/600/600`
	}
}));

// ✅ props에서 onVideoSelect 함수 받기
const Home = ({onVideoSelect}) => {

	const renderItem = ({index, ...rest}) => {
		const item = dummyData[index];
		return (
			<ImageItem
				{...rest}
				orientation="vertical"
				src={item.src}
				label={item.label}
				style={{
					height: '12.25rem',
					width:  '15rem'
				}}
				onClick={() => onVideoSelect(item.videoId)} // ✅ 클릭 시 상위로 전달
			>
				{item.title}
			</ImageItem>
		);
	};

	return (
		<VirtualGridList
			dataSize={dummyData.length}
			itemRenderer={renderItem}
			itemSize={{
				minWidth:  400,
				minHeight: 294
			}}
			spacing={24}
			direction="vertical"
			scrollMode="native"
		/>
	);
};

export default Home;
