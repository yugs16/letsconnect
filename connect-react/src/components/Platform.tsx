import { useEffect, useRef, useState } from 'react';
import { Manager, Socket, io } from 'socket.io-client';
import { SERVER_URI } from '../constants';

export default function Platform(props: any) {
	const { name, hostAudioTrack, hostVideoTrack } = props;
	const [lobby, setLobby] = useState(true);

	const remoteVideoRef = useRef<HTMLVideoElement>();
	const hostVideoRef = useRef<HTMLVideoElement>();

	useEffect(() => {
		// 	const manager = new Manager(SERVER_URI, {
		// 		autoConnect: false
		// 		});

		// const socket = manager.socket("/");

		// manager.open((err) => {
		//   if (err) {
		// 	console.log(err)
		//     // an error has occurred
		//   } else {
		// 	console.log('connection establisehd!!')

		//     // the connection was successfully established
		//   }
		// });

		const socket = io(SERVER_URI);

		socket.on('send-offer', async ({ lobbyId }) => {
			console.log('sending offer');
			alert('send offer');

			setLobby(false);

			const rtc = new RTCPeerConnection(); // host
			if (hostVideoTrack) {
				console.error('added tack');
				console.log(hostVideoTrack);
				rtc.addTrack(hostVideoTrack);
			}
			if (hostAudioTrack) {
				console.error('added tack');
				console.log(hostAudioTrack);
				rtc.addTrack(hostAudioTrack);
			}

			socket.emit('offer', {
				sdp: '', // rtc key
				lobbyId,
			});
		});

		socket.on('offer', async ({ lobbyId, sdp: remoteSdp }) => {
			console.log('received offer');
			alert('received offer');
			setLobby(false);

			const rtc = new RTCPeerConnection(); // remote

			rtc.setRemoteDescription(remoteSdp);
			const sdp = await rtc.createAnswer();

			rtc.setLocalDescription(sdp);
			const stream = new MediaStream();
			if (remoteVideoRef.current) {
				remoteVideoRef.current.srcObject = stream;
			}

      const track1 = rtc.getTransceivers()[0].receiver.track
      remoteVideoRef.current.srcObject.addTrack(track1) // video

      const track2 = rtc.getTransceivers()[1].receiver.track
      remoteVideoRef.current.srcObject.addTrack(track2) //audio
     
      remoteVideoRef.current.play();

			// trickle ice
			socket.emit('answer', {
				lobbyId,
				sdp: '', // rtc key
			});
		});

		socket.on('answer', () => {
			setLobby(false);

			alert('connection done!!');
		});

		socket.on('lobby', () => {
			setLobby(true);
		});
	}, [hostAudioTrack, hostVideoTrack, name]);

	useEffect(() => {
		if (hostVideoRef.current && hostVideoTrack) {
			hostVideoRef.current.srcObject = new MediaStream([hostVideoTrack]);
			hostVideoRef.current.play();
		}
	}, [hostVideoRef, hostVideoTrack]);

	if (lobby) return <div>Waiting for remote peer to connect...</div>;
	return (
		<>
			<div>
				I'm {name}
				<video autoPlay width={300} height={200} ref={hostVideoRef} />
				{lobby ? 'Waiting to connect you to someone' : null}
				<video autoPlay width={300} height={200} ref={remoteVideoRef} />
			</div>

			{/* <div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p> */}
		</>
	);
}
