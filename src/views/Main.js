import TabLayout, {Tab} from '@enact/sandstone/TabLayout';
import {Header, Panel} from '@enact/sandstone/Panels';
import $L from '@enact/i18n/$L';
import Home from './Home';
import Video from './Video';
import Account from './Account';
import HLSVideo from './HLSVideo';
import Icon from '@enact/sandstone/Icon';
const Main = (props) => {
	return (
		<Panel {...props}>
			<Header title= {<Icon style={{ fontSize: '2rem', fontWeight: 'bolder', width: '3rem', marginLeft: 0, paddingLeft: 0 }}>home</Icon>}/>
			<TabLayout>
				<Tab title={$L('Home')}>
					<Home />
				</Tab>
				<Tab title={$L('HLS Video Player')}>
					<HLSVideo src="https://cdn-vos-ppp-01.vos360.video/Content/HLS_HLSCLEAR/Live/channel(PPP-LL-2HLS)/index.m3u8" />
				</Tab>
				<Tab title={$L('Account')}>
					<Account />
				</Tab>
			</TabLayout>
		</Panel>
	);
};
export default Main;
