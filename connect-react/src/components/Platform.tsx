import { useEffect, useRef, useState } from 'react';
import { Manager, Socket, io } from 'socket.io-client';
import { SERVER_URI } from '../constants';

export default function Platform(props: any) {
	const { name, hostAudioTrack, hostVideoTrack } = props;
	const [lobby, setLobby] = useState(true);
	const [hostPeer, setHostPeer] = useState<null | RTCPeerConnection>(null);
	const [remotePeer, setRemotePeer] = useState<null | RTCPeerConnection>(null);
	const [socket, setSocket] = useState<null | Socket>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>();
	const hostVideoRef = useRef<HTMLVideoElement>();
	const [bothPlayed, setBothPlayed] = useState(1);

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
			// alert('send offer');

			setLobby(false);

			const rtc = new RTCPeerConnection(); // host
			setHostPeer(rtc);
			if (hostVideoTrack) {
				// console.log(hostVideoTrack);
				rtc.addTrack(hostVideoTrack);
			}
			if (hostAudioTrack) {
				// console.log(hostAudioTrack);
				rtc.addTrack(hostAudioTrack);
			}

			rtc.onicecandidate = async (e) => {
				if (e.candidate) {
					socket.emit('add-ice-candidate', {
						candidate: e.candidate,
						type: 'sender',
						lobbyId,
					});
				}
			};

			rtc.onnegotiationneeded = async () => {
				const sdp = await rtc.createOffer();
				rtc.setLocalDescription(sdp);
				socket.emit('offer', {
					sdp,
					lobbyId,
				});
			};

			// socket.emit('offer', {
			// 	sdp: '', // rtc key
			// 	lobbyId,
			// });
		});

		socket.on('offer', async ({ lobbyId, sdp: remoteSdp }) => {
			// console.log(' offer');
			// alert('received offer');
			setLobby(false);

			const rtc = new RTCPeerConnection(); // remote

			rtc.setRemoteDescription(remoteSdp);
			const sdp = await rtc.createAnswer();

			rtc.setLocalDescription(sdp);
			const stream = new MediaStream();
			if (remoteVideoRef.current) {
				remoteVideoRef.current.srcObject = stream;
			}
			setRemotePeer(rtc);
			window.pcr = rtc;

			rtc.ontrack = (e) => {
				console.log('ontrakc');
				console.log(e)
			};

			rtc.onicecandidate = async (e) => {
				if (!e.candidate) {
					return;
				}
				console.log('omn ice candidate on receiving seide');
				if (e.candidate) {
					socket.emit('add-ice-candidate', {
						candidate: e.candidate,
						type: 'receiver',
						lobbyId,
					});
				}
			};

			socket.emit('answer', {
				lobbyId,
				sdp: sdp, // remote key
			});

			setTimeout(() => {
				const track1 = rtc.getTransceivers()[0].receiver.track;
				const track2 = rtc.getTransceivers()[1].receiver.track;
				// console.log(track1);

				remoteVideoRef.current.srcObject.addTrack(track1);

				remoteVideoRef.current.srcObject.addTrack(track2);

				remoteVideoRef.current.play();

			}, 1000);
		});

		socket.on('answer', ({ lobbyId, sdp: remoteSdp }) => { 
			setLobby(false);
			// hostPeer?.setRemoteDescription(remoteSdp);
			// setHostPeer(hostPeer)

      		// hostPeer?.setRemoteDescription(remoteSdp);

			setHostPeer((prevVal) => { 
				prevVal?.setRemoteDescription(remoteSdp);
				return prevVal;
			});
			console.log('loop closed');
		});

		socket.on('lobby', () => {
			setLobby(true);
		});

		socket.on('add-ice-candidate', ({ candidate, type }) => {
			// console.log('add ice candidate from remote');
			// console.log({ candidate, type });
			if (type == 'sender') {
				// remotePeer?.addIceCandidate(candidate)
				// setRemotePeer(remotePeer);
        remotePeer?.addIceCandidate(candidate);
				setRemotePeer((prevVal) => {
					if (!prevVal) {
						console.error('receicng pc nout found');
					} else {
						console.error(prevVal.ontrack);
					}
					prevVal?.addIceCandidate(candidate);
					return prevVal;
				});
			} else {
				setHostPeer((prevVal) => {
					if (!prevVal) {
						console.error('sending pc nout found');
					} else {
						// console.error(pc.ontrack)
					}
					prevVal?.addIceCandidate(candidate);
					return prevVal;
				});
			} 
		});
		setSocket(socket)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name]);

	useEffect(() => {
		if (hostVideoRef.current && hostVideoTrack) {
			hostVideoRef.current.srcObject = new MediaStream([hostVideoTrack]);
			hostVideoRef.current.play();
		}
	}, [hostVideoRef, hostVideoTrack]);

	// useEffect(()=>{
	// 	console.log('host', hostVideoRef?.current?.played); 
	// 	console.log('remote', remoteVideoRef?.current?.played)

	// 	console.log(bothPlayed);
	
	// 	if(remoteVideoRef?.current?.played.length && hostVideoRef?.current?.played.length) {
	// 		console.log('inside........')
	// 		setBothPlayed(0); 
	// 		return;
	// 	} else {
	// 		console.log('else........')

	// 		if(bothPlayed !== 0)
	// 			setBothPlayed(bothPlayed + 1);
	// 	}
		

	// }, [bothPlayed])

	if (lobby) return <div>Waiting for remote peer to connect...</div>; 

//   console.log('hostVideoRef', hostVideoRef)  
	return (  
		<>
			<div>
				I'm {name}
				<video autoPlay width={300} height={200} ref={hostVideoRef} muted />
				{lobby ? 'Waiting to connect you to someone' : null}
				<video  autoPlay width={300} height={200} ref={remoteVideoRef} muted/>
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
