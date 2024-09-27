import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

function WelcomePage() {
  useEffect(() => {
    toast.success(<div style={{ fontWeight: 'bold' }}>
      👋 Welcome to Connectify
    </div>);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center relative">
      <ToastContainer />
      <Link to='/' className="absolute top-5 left-5 text-white font-nunito text-2xl font-bold">
        👋 Connectify
      </Link>
      <div className="w-[650px] h-[500px] flex flex-col items-center justify-center bg-[#1D1D1D] rounded-xl relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-16 text-white font-nunito text-2xl font-bold">
          👋 Welcome to Connectify!
        </div>
        <p className="w-[393px] text-center text-[#C4C5C5] font-nunito text-lg font-normal leading-7 mt-24">
          Connectify is designed to transform your virtual meetings with high-quality video, secure authentication, and real-time chat. Thank you for your patience and support as we prepare Connectify to connect people like never before :)
        </p>
        <Link to="/fullname" className="w-[224px] h-[42px] rounded-full bg-[#07F] text-white font-nunito text-lg font-bold leading-normal flex items-center justify-center mt-10">
          Create Account &rarr;
        </Link>
        <Link to='/signin' className="text-[#07F] font-nunito text-md font-normal opacity-80 mt-4 cursor-pointer">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default WelcomePage;
