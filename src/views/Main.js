import React, {useState} from 'react';
import TabLayout, {Tab} from '@enact/sandstone/TabLayout';
import {Header, Panel} from '@enact/sandstone/Panels';
import $L from '@enact/i18n/$L';
import Home from './Home';
import Account from './Account';
import Profile from './Profile';
import Video from './Video';
import SystemStatus from './SystemStatus';
import HLSVideo from './HLSVideo';
import Icon from '@enact/sandstone/Icon';
const Main = (props) => {
	// ✅ 상태 관리: 선택된 영상과 탭 index
	const [videoSrc, setVideoSrc] = useState(null);
	const [tabIndex, setTabIndex] = useState(0);

	// ✅ Home에서 영상 클릭 시 호출되는 콜백
	const handleVideoSelect = (src) => {
		setVideoSrc(src);
		setTabIndex(1); // HLS Video Player 탭으로 전환
	};

	return (
		<Panel {...props}>
			<Header
				style={{ height: '6rem'}}
				title={
					<Icon
						style={{
							fontSize: '2rem',
							fontWeight: 'bolder',
							width: '3rem',
							marginLeft: 0,
							paddingLeft: 0
						}}
					>
						home
					</Icon>
				}
			/>
			<TabLayout index={tabIndex} onSelect={({index}) => setTabIndex(index)}>
				<Tab title={$L('Home')}>
					<Home onVideoSelect={handleVideoSelect} />
				</Tab>
				<Tab title={$L('Video Player')}>
					<Video src={"/sample.mp4"} />
				</Tab>
				<Tab title={$L('Account')}>
					<Account />
				</Tab>
				<Tab title={$L('My Page')}>
					<Profile />
				</Tab>
				<Tab title={$L('Status')}>
					<SystemStatus />
				</Tab>
			</TabLayout>
		</Panel>
	);
};

export default Main;
