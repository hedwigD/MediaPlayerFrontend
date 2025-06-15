import VideoPlayer from '@enact/sandstone/VideoPlayer';
import {MediaControls} from '@enact/sandstone/MediaPlayer';
import Button from '@enact/sandstone/Button';
import {useRef, useEffect} from 'react';
import CommentSection from './CommentSection';

const Video = ({src, timestamp = 0}) => {
	const videoRef = useRef(null);

	useEffect(() => {
		const video = videoRef.current;
		if (video && timestamp > 0) {
			video.currentTime = timestamp;
		}
	}, [timestamp, src]);

	const handleCapture = () => {
		const video = videoRef.current;
		if (!video) return;

		const canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const ctx = canvas.getContext('2d');
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		const dataUrl = canvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = 'capture.png';
		link.click();
	};

	return (
		<div
			style={{
				height: '80vh',
				transform: 'scale(1)',
				transformOrigin: 'top',
				width: '90vw',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
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
					{/* eslint-disable-next-line */}
					<Button icon="camera" size="small" onClick={handleCapture}>캡처</Button>
				</MediaControls>
			</VideoPlayer>
			<CommentSection videoId={0} />
		</div>
	);
};

export default Video;