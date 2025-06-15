import {useState} from 'react';
import TabLayout, {Tab} from '@enact/sandstone/TabLayout';
import {Header, Panel} from '@enact/sandstone/Panels';
import $L from '@enact/i18n/$L';
import Home from './Home';
import Account from './Account';
import Profile from './Profile';
import SystemStatus from './SystemStatus';
import axios from 'axios';
import Video from './Video';
import Icon from '@enact/sandstone/Icon';
import Playlist from './Playlist';

const Main = (props) => {
	const [tabIndex, setTabIndex] = useState(2); // 기본 Account 탭
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [videoInfo, setVideoInfo] = useState({
		src: '',
		timestamp: 0
	});


	const handleVideoSelect = async (videoId) => {
	try {
		const res = await axios.get(`http://your.api/videos/${videoId}`);
		if (res.data.isSuccess) {
			const {sourceUrl, timestamp} = res.data.result;
			const timeInSec =
				timestamp.hour * 3600 + timestamp.minute * 60 + timestamp.second;

			setVideoInfo({src: sourceUrl, timestamp: timeInSec});
			setTabIndex(1); // Video Player 탭 전환
		}
	} catch (e) {
		console.error('영상 불러오기 실패', e);
	}
};

	const handleLoginSuccess = () => {
		setIsLoggedIn(true);
		setTabIndex(0); // 로그인 후 Home으로 이동
	};

	const forceToLoginTab = (index) => {
		if (!isLoggedIn && index !== 2) {
			return 2;
		}
		return index;
	};

	return (
		<Panel {...props}>
			<Header
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
			<TabLayout
				index={tabIndex}
				// eslint-disable-next-line
				onSelect={({index}) => setTabIndex(forceToLoginTab(index))}
			>
				<Tab title={$L('Home')}>
					{/* eslint-disable-next-line */}
					{isLoggedIn ? <Home onVideoSelect={handleVideoSelect} /> : null}
				</Tab>
				<Tab title={$L('Video Player')}>
					{isLoggedIn ? (
						<Video src={videoInfo.src} timestamp={videoInfo.timestamp} />
					) : null}
				</Tab>
				<Tab title={$L('재생목록')}>
					<Playlist onVideoSelect={handleVideoSelect} />
				</Tab>
				<Tab title={$L('Account')}>
					{/* eslint-disable-next-line */}
					<Account onLoginSuccess={handleLoginSuccess} />
				</Tab>
				<Tab title={$L('My Page')}>
					{isLoggedIn ? <Profile /> : null}
				</Tab>
				<Tab title={$L('Status')}>
					{isLoggedIn ? <SystemStatus /> : null}
				</Tab>
			</TabLayout>
		</Panel>
	);
};

export default Main;
