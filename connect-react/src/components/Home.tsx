import { useCallback, useEffect, useRef, useState } from 'react';
import Platform from './Platform';
import '../App.css';

export default function Home() {
	const [name, setName] = useState('');
	const [proceed, setProceed] = useState(false);
	const [hostAudioTrack, setHostAudioTrack] = useState<MediaStreamTrack | null>(
		null
	);
	const [hostVideoTrack, setHostVideoTrack] = useState<MediaStreamTrack | null>(
		null
	);
	const [video2, setVideo2] = useState(null)
	const videoRef = useRef<HTMLVideoElement>(null);

	const videoRef2 = useRef<HTMLVideoElement>(null)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getCam = useCallback(async () => {
		const stream = await window.navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});
		// MediaStream
		const audioTrack = stream.getAudioTracks()[0];
		const videoTrack = stream.getVideoTracks()[0];

		console.log('videoTrack ', stream.getVideoTracks())
		setHostAudioTrack(audioTrack);
		setHostVideoTrack(videoTrack);
		if (!videoRef.current) {
			return;
		}
		videoRef.current.srcObject = new MediaStream([videoTrack]);
		videoRef.current.play();

		if(!videoRef2.current) {
			return;
		}

		
		videoRef2.current.srcObject = new MediaStream([videoTrack]);
		videoRef2.current.play();

		
		console.log('niche=======');

		if(!video2 && videoTrack) {
			setVideo2(videoTrack)
			return;
		}

		// MediaStream
	}, []);

	useEffect(() => {
		if (videoRef && videoRef.current) {
		console.log('video ref===', videoRef);

			getCam();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoRef, getCam]);

	if (!proceed) {
		return (
			<div>

				<video key={'cvv1'} autoPlay id="v2"  ref={videoRef} ></video>
				

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
				{
					<video key={'cvv12'} id="v2" autoPlay ref={videoRef2} muted></video>
				}

			</div>
		);
	}

	return (
		<>
			{/* {!proceed && (
				<div>
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
			)} */}
			{proceed && (
				<Platform
					name={name}
					hostAudioTrack={hostAudioTrack}
					hostVideoTrack={hostVideoTrack}
				/>
			)}
		</>
	);

	return (
		<Platform
			name={name}
			hostAudioTrack={hostAudioTrack}
			hostVideoTrack={hostVideoTrack}
		/>
	);
}
