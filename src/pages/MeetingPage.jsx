import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFirebase } from '../firebase';
import { useSocket } from '../components/Context/SocketProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import peer from '../peer';
import FileSharing from './FileSharing';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Menu, X, Monitor, MonitorOff } from 'lucide-react';

const MeetingPage = () => {
  const { roomId } = useParams();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getUserDetails } = useFirebase();
  const [userDetails, setUserDetails] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [hostProfile, setHostProfile] = useState(null);
  const [participantProfile, setParticipantProfile] = useState(null);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localName, setLocalName] = useState('');
  const [remoteName, setRemoteName] = useState('');
  const [callInitiated, setCallInitiated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedRoomInfo = localStorage.getItem('roomInfo');
    if (savedRoomInfo) {
      const { isHost: savedIsHost, userDetails: savedUserDetails } = JSON.parse(savedRoomInfo);
      setIsHost(savedIsHost);
      setUserDetails(savedUserDetails);
    } else {
      const queryParams = new URLSearchParams(location.search);
      const role = queryParams.get('isHost') === 'true';
      setIsHost(role);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!userDetails && user) {
          const details = await getUserDetails(user.uid);
          setUserDetails(details);
          setLocalName(details.username);
          localStorage.setItem('roomInfo', JSON.stringify({ isHost, userDetails: details }));
          socket.emit('user:details', details);
        }
      } catch (error) {
        toast.error("Error fetching user details.");
      }
    };

    fetchUserDetails();
  }, [user, getUserDetails, userDetails, isHost, roomId, socket]);

  useEffect(() => {
    socket.emit('request:room:info', { roomId });

    return () => {
      socket.off('room:info');
      socket.off('participant:joined');
      socket.off('participant:left');
      socket.off('meeting:started');
      socket.off('meeting:ended');
      socket.off('room:full');
      socket.off("incomming:call");
      socket.off("call:accepted");
    };
  }, [socket, roomId]);

  useEffect(() => {
    const handleRoomInfo = ({ host, participant, meetingStarted }) => {
      setHostProfile(host || {});
      setParticipantProfile(participant || null);
      setMeetingStarted(meetingStarted);
      if (isHost) {
        setRemoteName(participant?.username || 'Waiting for participant...');
      } else {
        setRemoteName(host?.username || 'Waiting for host...');
      }
    };

    const handleParticipantJoined = (participant, { id }) => {
      if (participant && participant.username) {
        toast.info(`${participant.username} has joined the meeting.`);
        setParticipantProfile(participant);
        setRemoteSocketId(id);
        setMeetingStarted(false);
        if (isHost) {
          setRemoteName(participant.username);
        }
      }
    };

    const handleMeetingEnded = () => {
      toast.info('The meeting has ended. Redirecting to homepage...');
      stopLocalStream();
      localStorage.removeItem('roomInfo');
      setTimeout(() => {
        window.location.href = '/'; // This will reload the page and redirect to home
      }, 2000);
    };

    const handleRoomFull = (message) => {
      toast.error(message);
      navigate('/');
    };

    socket.on('room:info', handleRoomInfo);
    socket.on('participant:joined', handleParticipantJoined);
    socket.on('meeting:ended', handleMeetingEnded);
    socket.on('room:full', handleRoomFull);

    return () => {
      socket.off('room:info', handleRoomInfo);
      socket.off('participant:joined', handleParticipantJoined);
      socket.off('meeting:ended', handleMeetingEnded);
      socket.off('room:full', handleRoomFull);
    };
  }, [navigate, socket, isHost]);

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMyStream(stream);
      setCallInitiated(true);
      if (isHost && remoteSocketId) {
        const offer = await peer.getOffer();
        socket.emit('user:call', { to: remoteSocketId, offer });
      }
    } catch (error) {
      console.error('Error getting user media:', error);
      toast.error('Failed to access camera and microphone');
    }
  }, [remoteSocketId, socket, isHost]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      setShowIncomingCall(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans });
      } catch (error) {
        console.error('Error handling incoming call:', error);
        toast.error('Failed to access camera and microphone');
      }
    },
    [socket]
  );

  const acceptCall = useCallback(() => {
    setShowIncomingCall(false);
    setCallAccepted(true);
    sendStreams();
  }, [sendStreams]);

  
  const handleLeaveMeeting = useCallback(() => {
    stopLocalStream();
    socket.emit('leave:meeting', { roomId });
    toast.info('You have left the meeting. Redirecting to homepage...');
    localStorage.removeItem('roomInfo');
    window.location.href = '/'; // This will reload the page and redirect to home
  }, [roomId, socket]);
  
  const declineCall = useCallback(() => {
    handleLeaveMeeting();
  }, [handleLeaveMeeting]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      setCallAccepted(true);
      sendStreams();
    },
    [sendStreams]
  );

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams[0];
      setRemoteStream(remoteStream);
    });
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoIncoming = useCallback(async ({ from, offer }) => {
    try {
      const ans = await peer.getAnswer(offer);
      socket.emit('peer:nego:done', { to: from, ans });
    } catch (error) {
      console.error('Error handling negotiation:', error);
    }
  }, [socket]);

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    const handleMeetingStarted = () => {
      setMeetingStarted(true);
      toast.success('Meeting has started!');
      if (isHost) {
        handleCallUser();
      }
    };

    socket.on('meeting:started', handleMeetingStarted);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off('meeting:started', handleMeetingStarted);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [socket, handleCallUser, handleIncomingCall, handleCallAccepted, handleNegoIncoming, handleNegoNeedFinal, isHost]);

  const stopLocalStream = () => {
    if (myStream) {
      myStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    setMyStream(null);
  };


  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => toast.success('Meeting ID copied to clipboard!'))
      .catch(() => toast.error('Failed to copy Meeting ID.'));
  };

  const handleParticipantClick = () => {
    if (isHost && participantProfile) {
      socket.emit('meeting:start', { roomId });
      setMeetingStarted(true);
    }
  };

  useEffect(() => {
    if (localVideoRef.current && myStream) {
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleAudio = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!audioTrack.enabled);
      socket.emit('media:toggle', { roomId, type: 'audio', enabled: audioTrack.enabled });
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
      socket.emit('media:toggle', { roomId, type: 'video', enabled: videoTrack.enabled });
    }
  };

  useEffect(() => {
    const handleMediaToggle = ({ type, enabled, username }) => {
      if (type === 'audio') {
        console.log(`${username} has ${enabled ? 'unmuted' : 'muted'} their audio.`);
      } else if (type === 'video') {
        console.log(`${username} has turned their video ${enabled ? 'on' : 'off'}.`);
      }
    };

    socket.on('media:toggle', handleMediaToggle);

    return () => {
      socket.off('media:toggle', handleMediaToggle);
    };
  }, [socket]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-gray-900 to-gray-800 flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-full"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X className="text-white" size={24} /> : <Menu className="text-white" size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`w-full md:w-[350px] bg-gray-800 p-6 text-white flex flex-col shadow-lg transition-all duration-300 ease-in-out ${sidebarOpen ? 'fixed inset-0 z-40' : 'hidden md:flex'}`}>
        <h2 className="text-white font-nunito text-2xl mb-6 font-bold">Meeting ID: {roomId}</h2>
        <div className="flex items-center mb-6">
          <img
            src={hostProfile?.profilePicture || '/path_to_default_profile_picture.jpg'}
            alt="Host Profile"
            className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-blue-500"
          />
          <div>
            <p className="text-lg font-bold">{hostProfile?.username || 'Loading...'}</p>
            <p className="text-sm text-gray-400">Host</p>
          </div>
        </div>
        {participantProfile ? (
          <div className="flex items-center mb-6 cursor-pointer" onClick={handleParticipantClick}>
            <img
              src={participantProfile?.profilePicture || '/path_to_default_profile_picture.jpg'}
              alt="Participant Profile"
              className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-green-500"
            />
            <div>
              <p className="text-lg font-bold">{participantProfile?.username}</p>
              <p className="text-sm text-gray-400">Participant</p>
            </div>
          </div>
        ) : (
          <div className="mb-6 text-gray-400">Waiting for participant...</div>
        )}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 mb-4 transition duration-300 ease-in-out transform hover:scale-105"
          onClick={copyToClipboard}
        >
          Copy Meeting ID
        </button>
        {isHost && participantProfile && !meetingStarted && (
          <button
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-4 mb-4 transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleParticipantClick}
          >
            Start Meeting
          </button>
        )}
        <button
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-4 mt-auto transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleLeaveMeeting}
        >
          Leave Meeting
        </button>
        {meetingStarted && (
          <FileSharing roomId={roomId} remoteSocketId={remoteSocketId} />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center bg-gray-900 relative p-4 md:p-6">
        <div className="w-full h-full max-w-[1200px] max-h-[675px] bg-black rounded-xl overflow-hidden shadow-2xl relative">
          {(myStream && (isHost ? callInitiated : true)) && (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
            />
          )}
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <p className="text-white text-xl md:text-2xl">{localName} - Video Off</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 md:px-3 md:py-1 rounded-lg">
            <p className="text-white text-sm md:text-lg">{localName}</p>
          </div>
          
          {/* Controls overlay */}
          {myStream && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-4">
              <button 
                className={`p-2 md:p-3 rounded-full transition duration-300 ${isAudioMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={toggleAudio}
              >
                {isAudioMuted ? <MicOff className="text-white" size={20} /> : <Mic className="text-white" size={20} />}
              </button>
              <button 
                className={`p-2 md:p-3 rounded-full transition duration-300 ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="text-white" size={20} /> : <Video className="text-white" size={20} />}
              </button>
              <button 
                className="bg-red-600 p-2 md:p-3 rounded-full hover:bg-red-700 transition duration-300" 
                onClick={handleLeaveMeeting}
              >
                <PhoneOff className="text-white" size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Remote video box */}
        {remoteStream && (
          <div className="absolute top-4 right-4 w-1/3 h-1/3 md:w-[30%] md:h-[30%] bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-lg">
              <p className="text-white text-xs md:text-sm">{remoteName}</p>
            </div>
          </div>
        )}

        {/* Incoming call pop-up */}
        {showIncomingCall && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-4 md:p-6 rounded-xl shadow-2xl z-50 w-[90%] md:w-auto">
            <h3 className="text-white text-lg md:text-xl font-bold mb-4">Incoming Call</h3>
            <p className="text-gray-300 mb-6">{remoteName} is calling you.</p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-4 transition duration-300"
                onClick={declineCall}
              >
                Decline
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-4 transition duration-300"
                onClick={acceptCall}
              >
                Accept
              </button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default MeetingPage;