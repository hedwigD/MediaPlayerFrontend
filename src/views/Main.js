import {useState, useEffect} from 'react';
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
import Summary from './Summary';

const Main = (props) => {
	const [tabIndex, setTabIndex] = useState(3); // 기본 Account 탭
	const [token, setToken] = useState(null); 
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [viewIndex, setViewIndex] = useState(0);
	const [videoInfo, setVideoInfo] = useState({
		src: '',
		timestamp: 0
	});
	const [currentVideoId, setCurrentVideoId] = useState(null);

	useEffect(() => {
		if (token) {
		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		} else {
		delete axios.defaults.headers.common['Authorization'];
		}
	}, [token]);

	const handleVideoSelect = async (videoId) => {
	setCurrentVideoId(videoId);
	setTabIndex(1);

	try {
		const res = await axios.get(`http://15.165.123.189:8080/videos/${videoId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
		});

		if (res.data.isSuccess) {
		const {sourceUrl, timestamp} = res.data.result;
		const timeInSec = (() => {
		if (typeof timestamp === 'string') {
			const [h, m, s] = timestamp.split(':').map(Number);
			return h * 3600 + m * 60 + s;
		}
		return 0;
		})();

		setVideoInfo({src: sourceUrl, timestamp: timeInSec});
		}
	} catch (e) {
		console.error('영상 불러오기 실패', e);
	}
	};

	const handleLoginSuccess = (newToken) => {
		console.log('[Main] received token:', newToken);
		setToken(newToken);
		setIsLoggedIn(true);
		setTabIndex(0); // 로그인 후 Home으로 이동
	};

	const forceToLoginTab = (index) => {
		if (!isLoggedIn && index !== 3) {
			return 3;
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
					{isLoggedIn &&
						<Home
							token={token}                     // ← 여기 추가
							onVideoSelect={handleVideoSelect}
						/>
					}
				</Tab>
				<Tab title={$L('Video Player')}>
					{isLoggedIn ? (
						<Video
							src={videoInfo.src}
							timestamp={videoInfo.timestamp}
							videoId={currentVideoId}
							onViewSummary={(id) => {
								setCurrentVideoId(id);
								setTabIndex(5);
							}}
							onBackToHome={() => setTabIndex(0)}
							token={token}
						/>
					) : null}
				</Tab>
   				<Tab title={$L('재생목록')}>
					{isLoggedIn &&
					<Playlist
						token={token}                    // ← 여기에 token prop 추가
						onVideoSelect={handleVideoSelect}
					/>
					}
				</Tab>
				<Tab title={$L('Account')}>
					{/* eslint-disable-next-line */}
					<Account onLoginSuccess={handleLoginSuccess} />
				</Tab>
				<Tab title={$L('My Page')}>
					{isLoggedIn ? <Profile token={token} /> : null}
				</Tab>
				<Tab title={$L('요약')}>
					{isLoggedIn ? <Summary videoId={currentVideoId} /> : null}
				</Tab>
				<Tab title={$L('Status')}>
					{isLoggedIn ? <SystemStatus /> : null}
				</Tab>
			</TabLayout>
		</Panel>
	);
};

export default Main;
