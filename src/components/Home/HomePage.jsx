import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useFirebase } from '../../firebase';
import ProfileModal from '../UI/ProfileModal';
import { useSocket } from '../Context/SocketProvider';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout, deleteAccount, getUserDetails, createRoom, joinRoom } = useFirebase();
  const socket = useSocket();
  const [password, setPassword] = useState('');
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');

  useEffect(() => {
    if (user) {
      const isGoogle = user.providerData.some(provider => provider.providerId === 'google.com');
      setIsGoogleUser(isGoogle);
      const fetchUserDetails = async () => {
        try {
          const details = await getUserDetails(user.uid);
          setUserDetails(details);
        } catch (error) {
          toast.error("Error fetching user details.");
        }
      };
      fetchUserDetails();
    }
  }, [user, getUserDetails]);

  useEffect(() => {
    const handleError = (message) => {
      toast.error(message);
    };

    socket.on('error', handleError);

    return () => {
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout successful! Redirecting to login page...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (isGoogleUser) {
        await deleteAccount();
      } else {
        await deleteAccount(password);
      }
      toast.success('Account Deleted Successfully');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreateRoom = useCallback(() => {
    if (userDetails) {
      socket.emit('create:room', userDetails);
      
      socket.once('room:created', (newRoomId) => {
        navigate(`/meetingPage/${newRoomId}?isHost=true`);
      });
    }
  }, [socket, userDetails, navigate]);

  const handleJoinRoom = useCallback(() => {
    if (roomIdInput && userDetails) {
      socket.emit('join:room', { roomId: roomIdInput, userDetails });
      
      socket.once('room:joined', ({ roomId, host }) => {
        navigate(`/meetingPage/${roomId}?isHost=false`);
      });
    }
  }, [socket, roomIdInput, userDetails, navigate]);


  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center relative">
      <ToastContainer />
      <Link to='/' className="absolute top-5 left-5 text-white font-nunito text-2xl font-bold">👋 Connectify</Link>
      <div className="absolute top-5 right-5">
        <button onClick={openModal} className="relative w-[110px] h-[110px] flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full border-4 border-[#0b0b0b]"></div>
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
            <img src={userDetails?.profilePicture || '/path_to_default_profile_picture.jpg'} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </button>
      </div>
      <ProfileModal isOpen={isModalOpen} onClose={closeModal} userDetails={userDetails} handleLogout={handleLogout} handleDeleteAccount={handleDeleteAccount} />
      <div className="w-[650px] h-[500px] flex flex-col items-center justify-center bg-[#1D1D1D] rounded-xl relative p-6">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white font-nunito text-2xl font-bold">🎉 Welcome Home</div>
        <div className="flex flex-col justify-center bg-[#1D1D1D] p-8 rounded-2xl shadow-lg max-w-lg mx-auto">
          <h2 className="text-white font-nunito text-2xl mb-8 text-center">Create or Join a Room</h2>
          <button onClick={handleCreateRoom} className="w-full h-[50px] rounded-full bg-blue-600 text-white font-nunito text-lg font-bold flex items-center justify-center hover:bg-blue-700 transition duration-300 shadow-md">Create Room</button>
          <div className="flex items-center justify-center my-6">
            <hr className="w-1/3 border-gray-600" />
            <span className="mx-4 text-white font-nunito text-lg">OR</span>
            <hr className="w-1/3 border-gray-600" />
          </div>
          <input type="text" placeholder="Enter Room ID" value={roomIdInput} onChange={(e) => setRoomIdInput(e.target.value)} className="bg-gray-800 text-white px-4 py-2 rounded-md mb-4" />
          <button onClick={handleJoinRoom} className="bg-blue-500 text-white px-4 py-2 rounded-md">Join Room</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
