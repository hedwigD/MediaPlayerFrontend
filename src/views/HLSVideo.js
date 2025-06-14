import {useRef, useEffect, useCallback} from 'react';
import Button from '@enact/sandstone/Button';
import Hls from 'hls.js';

const HLSVideo = (props) => {
	const videoRef = useRef(null);
	const hlsRef = useRef(null);

	useEffect(() => {
		if (Hls.isSupported()) {
			const video = videoRef.current;
			const hls = new Hls();
			hls.loadSource(props.src);
			hls.attachMedia(video);

			hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
				console.log('manifest loaded:', data.levels.length + ' levels');
				video.play();
			});
			// eslint-disable-next-line
			hls.on(Hls.Events.FRAG_LOADED, function (event, data) {
				const index = hls.currentLevel;
				const level = hls.levels[index];
				console.log('Bandwidth:', hls.bandwidthEstimate);
				if (level) {
					console.log('Resolution:', level.height + 'p');
					console.log('Bitrate:', Math.round(level.bitrate / 1000) + ' kbps');
				}
			});

			hlsRef.current = hls;
		}
	}, [props.src]);

	// ✅ 레벨 조정 버튼
	const handleZeroClick = useCallback(() => {
		hlsRef.current.currentLevel = 0;
	}, []);

	const handleAutoClick = useCallback(() => {
		hlsRef.current.currentLevel = -1;
	}, []);

	// ✅ 캡처 버튼 함수
	const handleCapture = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;

		const canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const ctx = canvas.getContext('2d');
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		// 이미지 저장
		const dataUrl = canvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = 'capture.png';
		link.click();
	}, []);

	return (
		<>
			<div>
				<Button onClick={handleZeroClick}>Level 0</Button>
				<Button onClick={handleAutoClick}>Auto</Button>
				<Button icon="camera" size="small" onClick={handleCapture}>Capture</Button>
			</div>

			<video
				ref={videoRef}
				controls
				height={720}
				style={{ maxWidth: '100%' }}
				crossOrigin="anonymous" // 🔥 중요! 캡처하려면 CORS 허용 필요
			/>
		</>
	);
};

export default HLSVideo;
