import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai'; // Import the close icon
import { useFirebase } from '../../firebase'; // Import Firebase hook

const ProfileModal = ({ isOpen, onClose, userDetails, handleLogout }) => {
  const { updateUserProfile } = useFirebase(); // Add this if you have a function to update user profile
  const [bio, setBio] = useState(userDetails?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(userDetails?.phoneNumber || '');

  useEffect(() => {
    if (userDetails) {
      setBio(userDetails.bio || '');
      setPhoneNumber(userDetails.phoneNumber || '');
    }
  }, [userDetails]);

  const handleSave = async () => {
    try {
      await updateUserProfile({
        bio,
        phoneNumber
      });
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error updating user profile: ", error);
      // Optionally handle error state
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-[450px] bg-[#1D1D1D] rounded-lg p-6">
        <button onClick={onClose} className="absolute top-3 right-3 text-white text-2xl">
          <AiOutlineClose /> {/* Use the close icon */}
        </button>
        <div className="text-center mb-8 flex flex-col items-center">
          <span className="text-4xl mb-2">😊</span>
          <div className="text-white font-nunito text-xl font-bold">
            User Profile
          </div>
        </div>
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-[110px] h-[110px] flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full border-4 border-[#07F]"></div>
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
              <img
                src={userDetails?.profilePicture || '/path_to_default_profile_picture.jpg'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="text-center text-white font-nunito text-lg mb-8">
          <p>Name: {userDetails?.username || 'Name'}</p>
          <p>Email: {userDetails?.email || 'Email'}</p>
        </div>
        <div className="mb-6">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Add a short bio"
            rows="3"
            className="w-full bg-[#262626] text-white placeholder-[#888] border-none rounded-lg p-2"
          />
        </div>
        <div className="mb-6">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Add your phone number"
            className="w-full bg-[#262626] text-white placeholder-[#888] border-none rounded-lg p-2"
          />
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={handleSave} className="w-[100px] h-[42px] rounded-full bg-[#07F] text-white font-nunito text-lg font-bold leading-normal flex items-center justify-center">
            Save
          </button>
          <button onClick={handleLogout} className="w-[100px] h-[42px] rounded-full bg-red-600 text-white font-nunito text-lg font-bold leading-normal flex items-center justify-center">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
