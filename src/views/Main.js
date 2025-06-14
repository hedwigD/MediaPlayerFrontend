import React, {useState} from 'react';
import TabLayout, {Tab} from '@enact/sandstone/TabLayout';
import {Header, Panel} from '@enact/sandstone/Panels';
import $L from '@enact/i18n/$L';
import Home from './Home';
import Account from './Account';
import Profile from './Profile';
import SystemStatus from './SystemStatus';
import HLSVideo from './HLSVideo';
import Icon from '@enact/sandstone/Icon';

const Main = (props) => {
	const [videoSrc, setVideoSrc] = useState(null);
	const [tabIndex, setTabIndex] = useState(2); // 기본 Account 탭
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const handleVideoSelect = (src) => {
		setVideoSrc(src);
		setTabIndex(1);
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
				onSelect={({index}) => setTabIndex(forceToLoginTab(index))}
			>
				<Tab title={$L('Home')}>
					{isLoggedIn ? <Home onVideoSelect={handleVideoSelect} /> : null}
				</Tab>
				<Tab title={$L('HLS Video Player')}>
					{isLoggedIn ? (
						<HLSVideo
							src={
								videoSrc ||
								"https://cdn-vos-ppp-01.vos360.video/Content/HLS_HLSCLEAR/Live/channel(PPP-LL-2HLS)/index.m3u8"
							}
						/>
					) : null}
				</Tab>
				<Tab title={$L('Account')}>
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
