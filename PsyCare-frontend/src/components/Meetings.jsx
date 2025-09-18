import React, { useEffect, useRef, useState, useMemo } from 'react';
import styles from "../styles/meeting.module.css";
import { TextField, Button, IconButton, Dialog, DialogContent, Typography } from "@mui/material";
import io from "socket.io-client";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import MicOffIcon from "@mui/icons-material/MicOff";
import ChatIcon from "@mui/icons-material/Chat";
import Badge from "@mui/material/Badge";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';

const server_url = "http://localhost:5000";
var connections = {};
const peerConfigreConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
}

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let [meetingCode, setMeetingCode] = useState("");
  let [isShareOpen, setIsShareOpen] = useState(false);
  let [isCopied, setIsCopied] = useState(false);
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setModal] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);
  const [isLobbyVideoEnabled, setIsLobbyVideoEnabled] = useState(true);
  const [isLobbyAudioEnabled, setIsLobbyAudioEnabled] = useState(true);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const location = useLocation();
  const urlMeetingCode = useMemo(() => {
    if (meetingCode && meetingCode.trim()) return meetingCode.trim();
    const p = location.pathname.split("/");
    return p.length > 1 ? p[1].toUpperCase() : "";
  }, [meetingCode, location]);

  useEffect(() => {
    getPermissions()
  }, []);

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => { })
          .catch((e) => console.log(e))
      }
    }
  }

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) {
        setVideoAvailable(true);
        setIsVideoEnabled(true);
      } else {
        setVideoAvailable(false);
        setIsVideoEnabled(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ audio: audioAvailable, video: videoAvailable });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log("Error generated: " + err);
      setIsVideoEnabled(false);
    }
  }

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (e) { }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
          }).catch(err => console.log(err));
      })
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);
      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (e) { }
      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blackSilence()
      localVideoRef.current.srcObject = window.localStream
      for (let id in connections) {
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
            })
            .catch(e => console.log(e))
        })
      }
    })
  }

  let getUserMedia = (() => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch(err => console.log(err));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
      } catch { }
    }
  })

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (e) { }
    window.localStream = stream
    localVideoRef.current.srcObject = stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue
      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
          })
          .catch(e => console.log(e))
      })
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false)
      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (e) { }
      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blackSilence()
      localVideoRef.current.srcObject = window.localStream
      getUserMedia()
    })
  }

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new window.RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === 'offer') {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
              }).catch(e => console.log(e));
            }).catch(e => console.log(e));
          }
        }).catch(e => console.log(e));
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new window.RTCIceCandidate(signal.ice)).catch(e => console.log(e));
      }
    }
  }

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on('signal', gotMessageFromServer);
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat message", (data, sender, socketIdSender) => {
        addMessage(data, sender, socketIdSender);
      });
      socketRef.current.on('user-left', (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id))
      })
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new window.RTCPeerConnection(peerConfigreConnections);
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          }
          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);
            if (videoExists) {
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true
              }
              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              })
            }
          }
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        })
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (err) { }
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                })
                .catch(e => console.log(e))
            })
          }
        }
      })
    })
  }

  let silence = () => {
    let ctx = new window.AudioContext()
    let oscillator = ctx.createOscillator()
    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext('2d').fillRect(0, 0, width, height)
    let stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }

  let routeTo = useNavigate();
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  }

  let handleVideo = () => {
    setVideo(!video);
  }

  let handleAudio = () => {
    setAudio(!audio);
  }

  let handleLobbyVideo = () => {
    setIsLobbyVideoEnabled(!isLobbyVideoEnabled);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isLobbyVideoEnabled;
      });
    }
  }

  let handleLobbyAudio = () => {
    setIsLobbyAudioEnabled(!isLobbyAudioEnabled);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks()[0].enabled = !isLobbyAudioEnabled;
    }
  }

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen])

  let handleScreen = () => {
    setScreen(!screen);
  }

  let handleChat = () => {
    setModal(!showModal);
    setNewMessages(0);
  }

  let sendMessage = () => {
    if (!message.trim()) return; // Prevent sending empty messages
    socketRef.current.emit('chat message', message, username);
    // Immediately add own message to chat
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: username || "You", data: message }
    ]);
    setMessage("");
    setNewMessages(0);
  }

  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    } catch (err) { }
    // Show thank you dialog on end call press
    setShowThankYouDialog(true);
    // Redirect after 3 seconds
    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token && token.trim() !== "") {
        routeTo("/dashboard");
      } else {
        routeTo("/");
      }
    }, 3000);
  }

  const shareUrl = urlMeetingCode
    ? `${window.location.origin}/${urlMeetingCode}`
    : window.location.origin;

  const handleCopy = () => {
    if (urlMeetingCode) {
      const link = `${window.location.origin}/${urlMeetingCode}`;
      navigator.clipboard.writeText(link)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        });
    } else {
      alert("You have not made your meeting code");
    }
  };

  return (
    <div className={styles.mainWrapper}>
      {askForUsername === true ?
        <div className={styles.lobbyFormContainer}>
          <div className={styles.videoStreamContainer}>
            {isLobbyVideoEnabled ? (
              <video ref={localVideoRef} autoPlay muted className={styles.videoPlayer} />
            ) : (
              <div className={styles.videoPlaceholder}>
                <PersonIcon className={styles.avatar} />
                <p>Camera is off</p>
              </div>
            )}
          </div>
          <h2 className={styles.lobbyHeading}>Connect Space</h2>
          <p style={{
            color: '#54575b',
            fontSize: '1rem'
          }}>Step in! Connect! Collaborate!</p>
          <div className={styles.lobbyControls}>
            <IconButton onClick={handleLobbyVideo} className={styles.lobbyControlButton}>
              {isLobbyVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleLobbyAudio} className={styles.lobbyControlButton}>
              {isLobbyAudioEnabled ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
          </div>
          <Button variant="contained" onClick={connect} className={styles.connectButton}>Connect</Button>
        </div>
        :
        <div className={styles.meetVideoContainer}>
          <>
            <div className={`${styles.chatRoom} ${showModal ? styles.show : ''}`}>
              <div className={styles.chatContainer}>
                <div className={styles.chatHeaderRow}>
                  <IconButton
                    className={styles.closeButton}
                    onClick={handleChat}
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton>
                  <h1 className={styles.chatHeader}>Chat</h1>
                </div>
                <div className={styles.chattingDisplay}>
                  {messages.length > 0 ? (
                    messages.map((item, index) => (
                      <div className={styles.message} key={index}>
                        <p className={styles.messageSender}>{item.sender}</p>
                        <p className={styles.messageText}>{item.data}</p>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noMessages}>No Messages Yet</p>
                  )}
                </div>
                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Chat"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ style: { color: '#a682e3' } }}
                    InputProps={{
                      style: {
                        color: '#303156',
                        backgroundColor: '#f7f6ff'
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#c9bdf3',
                        },
                        '&:hover fieldset': {
                          borderColor: '#67c7fc',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#a682e3',
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={sendMessage}
                    className={styles.sendButton}
                  >
                    SEND
                  </Button>
                </div>
              </div>
            </div>
            <div className={styles.btnContainer}>
              <IconButton onClick={handleVideo} className={styles.controlButton}>
                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton onClick={handleEndCall} className={styles.endCallButton}>
                <CallEndIcon />
              </IconButton>
              <IconButton onClick={handleAudio} className={styles.controlButton}>
                {(audio === true) ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
              {screenAvailable === true ?
                <IconButton onClick={handleScreen} className={styles.controlButton}>
                  {(screen === true) ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton> : <></>}
              <Badge badgeContent={newMessages} max={99} color='secondary'>
                <IconButton onClick={handleChat} className={styles.controlButton}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>
            {video === true ? (
              <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
            ) : (
              <div className={styles.videoPlaceholderInMeet}>
                <PersonIcon className={styles.avatar} />
                <p>Camera is off</p>
              </div>
            )}
            <div
              className={`
                  ${styles.conferenceView}
                  ${videos.length === 1 ? styles.one : ''}
                  ${videos.length === 2 ? styles.two : ''}
                  ${videos.length === 3 ? styles.three : ''}
                  ${videos.length === 4 ? styles.four : ''}
                  ${videos.length > 4 ? styles.many : ''}
                `}
            >
              {videos.map((video) => (
                <div key={video.socketId} className={styles.videoCell}>
                  <video
                    data-socket={video.socketId}
                    ref={ref => {
                      if (ref && video.stream) ref.srcObject = video.stream;
                    }}
                    autoPlay
                  ></video>
                </div>
              ))}
            </div>
            {/* Thank You Dialog */}
            <Dialog
              open={showThankYouDialog}
              onClose={() => setShowThankYouDialog(false)}
              PaperProps={{
                style: {
                  background: 'linear-gradient(135deg, #ebe1fc 0%, #dbf0ff 100%)',
                  borderRadius: 24,
                  boxShadow: '0 8px 30px rgba(166,130,227,0.14)',
                  padding: '24px 48px',
                  textAlign: 'center',
                  minWidth: '300px',
                }
              }}
            >
              <DialogContent>
                <Typography variant="h5" style={{ color: '#674ba2', fontWeight: 'bold', marginBottom: 8 }}>
                  Thank You for Attending!
                </Typography>
                <Typography variant="body1" style={{ color: '#303156' }}>
                  We appreciate your time. Remember, taking care of your mental health is important. Stay positive, and reach out if you need support.
                </Typography>
              </DialogContent>
            </Dialog>
          </>
        </div>
      }
    </div>
  );
}