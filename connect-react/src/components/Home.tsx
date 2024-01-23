import { useCallback, useEffect, useRef, useState } from 'react';
import Platform from './Platform';
import '../App.css';

export default function Home() {
	const [name, setName] = useState('');
	const [proceed, setProceed] = useState(false);
	const [hostAudioTrack, setHostAudioTrack] =
		useState<MediaStreamTrack | null>(null);
	const [hostVideoTrack, setHostVideoTrack] =
		useState<MediaStreamTrack | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	const getCam = useCallback(async () => {
			const stream = await window.navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
			// MediaStream
			const audioTrack = stream.getAudioTracks()[0];
			const videoTrack = stream.getVideoTracks()[0];
			setHostAudioTrack(audioTrack);
			setHostVideoTrack(videoTrack);
			if (!videoRef.current) {
				return;
			}
			videoRef.current.srcObject = new MediaStream([videoTrack]);
			videoRef.current.play();
			// MediaStream
	}, []);

	useEffect(() => {
		console.log('video ref===', videoRef);
		if (videoRef && videoRef.current) {
			getCam();
		}
	}, [videoRef, getCam]);

	if (!proceed) {
		return (
			<div>
				<video autoPlay ref={videoRef}></video>
				<label>Enter Name: </label>
				<input
					type="text"
					max={3}
					required
					onChange={(e) => setName(e.target.value)}
					placeholder="Enter your connect name"
				></input>
				<button onClick={() => setProceed(true)} className="proceed">
					Proceed
				</button>
			</div>
		);
	}

	return proceed && <Platform name={name} hostAudioTrack={hostAudioTrack} hostVideoTrack={hostVideoTrack}/>;
}
