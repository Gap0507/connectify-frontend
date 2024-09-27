import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,useLocation,useParams } from 'react-router-dom';
import { UserProvider } from './components/Context/UserContext';
import WelcomePage from './components/UI/WelcomePage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import FullName from './components/Auth/FullName';
import ProfilePicture from './components/Auth/ProfilePicture';
import DefaultProfileImage from './Assets/DefaultProfilePic.svg';
import HomePage from './components/Home/HomePage';
import { useFirebase } from './firebase';
import { ProfileProvider } from './components/Context/ProfileContext';
import { SocketProvider } from './components/Context/SocketProvider';
import MeetingPage from './pages/MeetingPage';
function App() {
  const { isLoggedIn, loading } = useFirebase();
  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#121212] flex items-center justify-center relative">
       <div className="w-[650px] h-[500px] flex flex-col items-center justify-center bg-[#1D1D1D] rounded-xl relative p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500 mx-auto"></div>
          <h2 className="text-zinc-900 dark:text-white mt-4">Loading...</h2>
        </div>
       </div>
      </div>
    );
  }
  return (
    <UserProvider>
      <ProfileProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <WelcomePage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/fullname" element={<FullName />} />
              <Route path="/profile" element={<ProfilePicture defaultProfileImage={DefaultProfileImage} />} />
              <Route path="/home" element={isLoggedIn ? <HomePage /> : <Navigate to="/" />} />
              <Route path="/meetingPage/:roomId" element={isLoggedIn ? <MeetingPage /> : <Navigate to="/" />} />
              </Routes>
          </Router>
        </SocketProvider>
      </ProfileProvider>
    </UserProvider>
  );
}


export default App;
