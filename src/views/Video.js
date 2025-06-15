import VideoPlayer from '@enact/sandstone/VideoPlayer';
import {MediaControls} from '@enact/sandstone/MediaPlayer';
import Button from '@enact/sandstone/Button';
import {useRef, useEffect} from 'react';

const Video = ({src, timestamp = 0}) => {
	const videoRef = useRef(null);

	useEffect(() => {
		const video = videoRef.current;
		if (video && timestamp > 0) {
			video.currentTime = timestamp;
		}
	}, [timestamp, src]);

	return (
		<div
			style={{
				height: '80vh',
				transform: 'scale(1)',
				transformOrigin: 'top',
				width: '90vw',
				display: 'flex',
				justifyContent: 'center',
				margin: '0 auto'
			}}
		>
			<VideoPlayer
				ref={videoRef}
				autoCloseTimeout={7000}
				backButtonAriaLabel="go to previous"
				feedbackHideDelay={30}
				initialJumpDelay={400}
				jumpDelay={400}
				loop
				miniFeedbackHideDelay={2000}
				muted
				title="재생 중인 영상"
				titleHideDelay={4000}
			>
				<source src={src} type="video/mp4" />
				<infoComponents>
					A video about some things happening to and around some characters.
				</infoComponents>
				<MediaControls
					jumpBackwardIcon="jumpbackward"
					jumpForwardIcon="jumpforward"
					pauseIcon="pause"
					playIcon="play"
				>
					<Button icon="list" size="small" />
					<Button icon="playspeed" size="small" />
					<Button icon="speakercenter" size="small" />
					<Button icon="miniplayer" size="small" />
					<Button icon="subtitle" size="small" />
				</MediaControls>
			</VideoPlayer>
		</div>
	);
};

export default Video;
