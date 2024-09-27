import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import googleIcon from '../Assets/google.png';
import { useFirebase } from '../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignIn() {
  const firebase = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebase.signinUserWithEmailAndPassword(email, password);
      toast.success('SignIn Successful! Welcome');
      setTimeout(() => {
        navigate('/home');
        setLoading(false);
      }, 2000); // Redirect to the next step after 2 seconds
    } catch (error) {
      console.error('Error during login: ', error);
      toast.error(error.message);
      setLoading(false);
    }
  }, [navigate, email, password, firebase]);

  const handleGoogleSignIn = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await firebase.signinWithGoogle();
      toast.success('Google Sign-in successful! Redirecting to Home');
      setTimeout(() => {
        navigate('/home');
        setLoading(false);
      }, 2000); // Redirect to the next step after 2 seconds
    } catch (error) {
      console.error('Error during Google Sign-In: ', error);
      toast.error(error.message);
      setLoading(false);
    }
  }, [navigate, firebase]);

  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center relative">
      <ToastContainer />
      <Link to='/' className="absolute top-5 left-5 text-white font-nunito text-2xl font-bold">
        👋 Connectify
      </Link>
      <div className="w-[650px] h-[500px] flex flex-col items-center justify-center bg-[#1D1D1D] rounded-xl relative p-6">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white font-nunito text-2xl font-bold">
          📱 Sign In
        </div>
        <form onSubmit={handleSignIn} className="flex flex-col items-center w-[80%] max-w-md mt-10">
          <div className="w-full bg-[#1D1D1D] rounded-[20px] flex items-center px-4 py-2 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 bg-[#1D1D1D] text-white placeholder-[#888] border-none rounded-lg pl-2"
              required
            />
          </div>
          <div className="w-full bg-[#1D1D1D] rounded-[20px] flex items-center px-4 py-2 mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 bg-[#1D1D1D] text-white placeholder-[#888] border-none rounded-lg pl-2"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-[224px] h-[42px] rounded-full ${loading ? 'bg-gray-500' : 'bg-[#07F]'} text-white font-nunito text-lg font-bold leading-normal flex items-center justify-center mt-4`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <button
            onClick={handleGoogleSignIn}
            className={`w-[224px] h-[50px] rounded-full bg-[#1D1D1D] border border-[#07F] text-white font-nunito text-lg font-bold leading-normal flex items-center justify-center mt-4 ${loading ? 'bg-gray-500' : 'bg-[#1D1D1D]'}`}
            disabled={loading}
          >
            <img src={googleIcon} alt="Google Icon" className="w-6 h-6 mr-2" />
            {loading ? 'Signing In...' : 'Continue with Google'}
          </button>
        </form>
        <p className="text-[#888] text-sm font-nunito mt-8">
          Enter the Email you added while creating your account
        </p>
      </div>
    </div>
  );
}

export default SignIn;
