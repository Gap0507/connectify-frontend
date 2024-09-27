import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import googleIcon from '../Assets/google.png';
import { useFirebase } from '../firebase';
import { useProfile } from '../components/Context/ProfileContext'; // Adjust path if needed

function SignUp() {
  const firebase = useFirebase();
  const { profileImage } = useProfile(); // Use context to get profile picture
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    toast.success(<div style={{ fontWeight: 'bold' }}>🎉 Create Your Account</div>);
  }, []);

  const handleSignUp = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await firebase.signupUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await firebase.handleNewUserWithEmail(email, username, profileImage, user);

      toast.success('Signup successful! Redirecting to the next step...');
      setTimeout(() => {
        navigate('/home');
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.log("Error during Register: ", error);
      toast.error(error.message);
      setLoading(false);
    }
  }, [email, password, username, profileImage, navigate, firebase]);

  const handleGoogleSignUp = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await firebase.signinWithGoogle();
      const user = userCredential.user;

      await firebase.handleNewUserWithGoogle(profileImage, user);

      toast.success('Google Signup successful!...');
      setTimeout(() => {
        navigate('/home');
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.log("Error during Google Sign-Up: ", error);
      toast.error(error.message);
      setLoading(false);
    }
  }, [profileImage, navigate, firebase]);

  return (
    <div className="w-screen h-screen bg-[#121212] flex items-center justify-center relative">
      <ToastContainer />
      <Link to='/' className="absolute top-5 left-5 text-white font-nunito text-2xl font-bold">
        👋 Connectify
      </Link>
      <div className="w-[650px] h-[500px] flex flex-col items-center justify-center bg-[#1D1D1D] rounded-xl relative p-6">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white font-nunito text-2xl font-bold">
          🎉  Sign Up
        </div>
        <form onSubmit={handleSignUp} className="flex flex-col items-center w-[80%] max-w-md mt-10">
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
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            className={`w-[224px] h-[42px] rounded-full bg-[#07F] text-white font-nunito text-lg font-bold leading-normal flex items-center justify-center mt-4 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="flex items-center mt-6 mb-6">
          <hr className="w-20 border-[#333] border-t-1 mr-2" />
          <span className="text-[#888]">or</span>
          <hr className="w-20 border-[#333] border-t-1 ml-2" />
        </div>
        <button
          onClick={handleGoogleSignUp}
          className="w-[224px] h-[42px] rounded-full bg-[#1D1D1D] border-2 border-[#07F] text-[#07F] font-nunito text-lg font-bold leading-normal flex items-center justify-center mb-4"
        >
          <img src={googleIcon} alt="Google" className="w-6 h-6 mr-2" />
          {loading ? 'Signing up...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}

export default SignUp;
