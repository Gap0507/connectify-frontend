import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useProfile } from '../Context/ProfileContext'; // Adjust path if needed

const ProfilePicture = ({ defaultProfileImage }) => {
  const navigate = useNavigate();
  const { profileImage, setProfileImage } = useProfile();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setProfileImage(file); // Store the file itself for upload
        toast.success(<div style={{ fontWeight: 'bold' }}>Photo updated successfully!</div>);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    toast.success(<div style={{ fontWeight: 'bold' }}>Profile picture saved!</div>);
    setTimeout(() => navigate('/signup'), 2000); // Redirect to the next step after 2 seconds
  };

  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center relative">
      <ToastContainer />
      <Link to="/" className="absolute top-5 left-5 text-white font-nunito text-2xl font-bold">
        👋 Connectify
      </Link>
      <div className="w-[650px] h-[460px] flex flex-col items-center justify-center bg-[#1D1D1D] rounded-xl relative p-6">
        <div className="text-center mb-8 flex flex-col items-center">
          <span className="text-4xl mb-2">😊</span>
          <div className="text-white font-nunito text-xl font-bold">
            Okay 
          </div>
        </div>
        <p className="w-[115px] h-[19px] text-[#C4C5C5] text-center font-nunito text-sm font-normal mb-8 opacity-80">
          How’s this photo?
        </p>
        <div className="relative w-[110px] h-[110px] flex items-center justify-center mb-8">
          <div className="absolute w-full h-full rounded-full border-4 border-[#07F]"></div>
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
            <img
              src={profileImage ? URL.createObjectURL(profileImage) : defaultProfileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <label className="text-[#07F] text-sm font-nunito font-normal mb-8 cursor-pointer">
          Choose a different photo
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <button onClick={handleNext} className="w-[224px] h-[42px] rounded-full bg-[#07F] text-white font-nunito text-lg font-bold leading-normal flex items-center justify-center">
          Next →
        </button>
      </div>
    </div>
  );
};

export default ProfilePicture;
