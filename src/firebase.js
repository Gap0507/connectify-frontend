import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { createContext, useContext, useState, useEffect } from "react";
import { getFirestore, doc, setDoc, getDoc, updateDoc} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyA6xmhc256mrspmUoGbNE81Xn8binu5Tg0",
  authDomain: "connectify-610cf.firebaseapp.com",
  projectId: "connectify-610cf",
  storageBucket: "connectify-610cf.appspot.com",
  messagingSenderId: "675723282883",
  appId: "1:675723282883:web:67f3e56ee1fc105cbb9576",
  measurementId: "G-76ZQWFG060"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) setUser(user);
      else setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signupUserWithEmailAndPassword = (email, password) => {
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signinUserWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signinWithGoogle = () => {
    return signInWithPopup(firebaseAuth, googleProvider);
  };

  const logout = async () => {
    if (user) {
      await signOut(firebaseAuth);
      setUser(null);
    }
  };

  const deleteAccount = async (password = null) => {
    if (user) {
      try {
        if (password) {
          const credential = EmailAuthProvider.credential(user.email, password);
          await reauthenticateWithCredential(user, credential);
        }
        await deleteUser(user);
        setUser(null);
      } catch (error) {
        console.error("Error during re-authentication and account deletion: ", error);
        throw error;
      }
    }
  };

  
  const isLoggedIn = !!user;

  // Firestore and Storage functions
  const handleNewUserWithEmail = async (email, username, profilePicture, user) => {
    try {
      let profilePictureUrl = null;
      if (profilePicture) {
        const imageRef = ref(storage, `uploads/images/${Date.now()}-${profilePicture.name}`);
        await uploadBytes(imageRef, profilePicture, { contentType: 'image/jpeg' });
        profilePictureUrl = await getDownloadURL(imageRef);
      }
      const userDoc = {
        email,
        username,
        profilePicture: profilePictureUrl,
        userID: user.uid,
        createdAt: Date.now()
      };
      await setDoc(doc(firestore, 'users', user.uid), userDoc);
      console.log("User added successfully.");
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const handleNewUserWithGoogle = async (profilePicture, user) => {
    try {
      let profilePictureUrl = null;
      if (profilePicture) {
        const imageRef = ref(storage, `uploads/images/${Date.now()}-${profilePicture}`);
        await uploadBytes(imageRef, profilePicture, { contentType: 'image/jpeg' });
        profilePictureUrl = await getDownloadURL(imageRef);
      }
      const userDoc = {
        email: user.email,
        username: user.displayName,
        profilePicture: profilePictureUrl,
        userID: user.uid,
        createdAt: Date.now()
      };
      await setDoc(doc(firestore, 'users', user.uid), userDoc);
      console.log("User added successfully.");
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const getUserDetails = async (userId) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        console.error("No such document!");
        throw new Error("No user details found.");
      }
    } catch (error) {
      console.error("Error fetching user details: ", error);
      throw error;
    }
  };

  const updateUserProfile = async ({ bio, phoneNumber }) => {
    if (user) {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
          bio: bio || "",
          phoneNumber: phoneNumber || ""
        });
        console.log("User profile updated successfully.");
      } catch (error) {
        console.error("Error updating user profile: ", error);
        throw error;
      }
    } else {
      throw new Error('No user is currently signed in.');
    }
  };  
  
 
  return (
    <FirebaseContext.Provider value={{ 
      signupUserWithEmailAndPassword, 
      signinUserWithEmailAndPassword, 
      signinWithGoogle, 
      logout, 
      deleteAccount,
      handleNewUserWithEmail,
      handleNewUserWithGoogle,
      isLoggedIn, 
      loading,
      firestore,
      storage,
      user,
      getUserDetails,
      updateUserProfile,
    }}>
      {props.children}
    </FirebaseContext.Provider>
  );
};


