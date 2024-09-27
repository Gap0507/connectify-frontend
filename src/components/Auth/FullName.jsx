import React, { useState } from 'react';
import { useUser } from '../Context/UserContext';  // Adjust path if needed
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FullName = () => {
  const [name, setName] = useState('');
  const { setFullName } = useUser();
  const navigate = useNavigate();

  const handleNext = () => {
    if (name.trim() === '') {
      toast.error(<div style={{ fontWeight: 'bold' }}>Please enter your full name.</div>);
      return;
    }

    setFullName(name);
    toast.success(<div style={{ fontWeight: 'bold' }}>Name set successfully!</div>);
    setTimeout(() => navigate('/profile'), 2000); // Redirect to the profile page after 2 seconds
  };

  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center relative">
      <ToastContainer />
      <div className="absolute top-5 left-5 text-white font-nunito text-2xl font-bold">
        👋 Connectify
      </div>
      <div className="w-[650px] h-[380px] flex flex-col justify-between bg-[#1D1D1D] rounded-xl p-6">
        <div className="text-center">
          <span className="text-4xl mb-2">📝</span>
          <div className="text-white font-nunito text-xl font-bold">
            What’s your full name?
          </div>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="w-[325px] h-[40px] bg-[#262626] text-white placeholder-[#888] border-none rounded-lg self-center"
        />
        <p className="text-[#C4C5C5] text-center text-sm font-nunito mt-4">
          People use real names at Connectify :)
        </p>
        <button
          onClick={handleNext}
          className="w-[179px] h-[42px] rounded-full bg-[#07F] text-white font-nunito text-lg font-bold flex items-center justify-center self-center"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
};

export default FullName;
