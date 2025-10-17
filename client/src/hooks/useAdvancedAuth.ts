import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  collection, 
  where, 
  getDocs,
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
  uid: string;
  name: string;
  email?: string;
  userName?: string;
  phone?: string;
  userClass: string;
  listOfCourses: string[];
  coins: number;
  deviceId?: string;
  password?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
}

interface RegisterData {
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  class: string;
  password?: string;
  deviceId?: string;
}

export const useAdvancedAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    let userDocUnsubscribe: (() => void) | null = null;
    
    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      // Clean up previous user document listener
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        userDocUnsubscribe = null;
      }
      
      if (firebaseUser) {
        console.log('Firebase user:', firebaseUser.uid, firebaseUser.email);
        setUser(firebaseUser);
        
        // Set up real-time listener for user document
        userDocUnsubscribe = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (userDoc) => {
            if (userDoc.exists()) {
              console.log('User data updated:', userDoc.data());
              setUserData(userDoc.data() as UserData);
            } else {
              console.log('No user document found in Firestore');
              setUserData(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to user data:', error);
            setUserData(null);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, []);

  const initRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('Recaptcha verified:', response);
        },
        'expired-callback': () => {
          console.log('Recaptcha expired');
        }
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  const findUserByIdentifier = async (identifier: string) => {
    const queries = [
      query(collection(db, 'users'), where('email', '==', identifier)),
      query(collection(db, 'users'), where('phone', '==', identifier)),
      query(collection(db, 'users'), where('userName', '==', identifier))
    ];

    for (const q of queries) {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as UserData;
      }
    }
    return null;
  };

  const login = async (identifier: string, password?: string) => {
    console.log('Login attempt with identifier:', identifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\+?[\d\s-()]+$/.test(identifier);

    if (isEmail && password) {
      console.log('Attempting email login');
      return signInWithEmailAndPassword(auth, identifier, password);
    } else if (isPhone) {
      console.log('Attempting phone login');
      const verifier = initRecaptcha();
      return signInWithPhoneNumber(auth, identifier, verifier);
    } else {
      console.log('Attempting username login, searching for user...');
      const userData = await findUserByIdentifier(identifier);
      if (userData?.email && password) {
        console.log('Found user, attempting email login with:', userData.email);
        return signInWithEmailAndPassword(auth, userData.email, password);
      }
      throw new Error('User not found or invalid credentials');
    }
  };

  const register = async (data: RegisterData) => {
    console.log('Registration attempt with data:', { ...data, password: '[HIDDEN]' });
    let user: User;

    if (data.email && data.password) {
      console.log('Creating user with email and password');
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      user = result.user;
      console.log('User created successfully:', user.uid);
    } else if (data.phone) {
      console.log('Attempting phone registration');
      const verifier = initRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, data.phone, verifier);
      return { confirmationResult, requiresOTP: true, userData: data };
    } else {
      throw new Error('Either email+password or phone number is required');
    }

    console.log('Updating user profile...');
    await updateProfile(user, { displayName: data.name });

    console.log('Creating user document in Firestore...');
    const userData = {
      uid: user.uid,
      name: data.name,
      email: data.email || null,
      userName: data.username || null,
      phone: data.phone || null,
      userClass: data.class,
      listOfCourses: [],
      coins: 0,
      deviceId: data.deviceId || null,
      password: data.password || null,
      emailVerified: data.email ? user.emailVerified : false,
      phoneVerified: data.phone ? true : false,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('User document created successfully');

    // Send email verification if email is provided
    if (data.email) {
      try {
        await sendEmailVerification(user);
        console.log('Email verification sent');
      } catch (error) {
        console.error('Failed to send email verification:', error);
      }
    }

    return { user, requiresOTP: false };
  };

  const verifyOTP = async (confirmationResult: any, otp: string, userData?: RegisterData) => {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;
    
    // If this is registration (userData provided), create user document
    if (userData && user) {
      console.log('Creating user document after phone verification...');
      await updateProfile(user, { displayName: userData.name });
      
      const userDocData = {
        uid: user.uid,
        name: userData.name,
        email: userData.email || null,
        userName: userData.username || null,
        phone: userData.phone || null,
        userClass: userData.class,
        listOfCourses: [],
        coins: 0,
        deviceId: userData.deviceId || null,
        password: userData.password || null,
        emailVerified: false,
        phoneVerified: true,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userDocData);
      console.log('User document created after phone verification');
    }
    
    return result;
  };

  const linkEmailToAccount = async (email: string, password: string) => {
    if (!user) throw new Error('No user logged in');
    
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
    
    await updateDoc(doc(db, 'users', user.uid), {
      email: email,
      emailVerified: false
    });
  };

  const sendPhoneOTP = async (phoneNumber: string) => {
    try {
      const verifier = initRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      console.log('SMS sent successfully');
      return confirmationResult;
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      // Reset recaptcha on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
      throw error;
    }
  };

  const linkPhoneToAccount = async (phone: string) => {
    if (!user) throw new Error('No user logged in');
    return sendPhoneOTP(phone);
  };

  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const resetPasswordWithPhone = async (phone: string) => {
    return sendPhoneOTP(phone);
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    return updatePassword(user, newPassword);
  };

  const sendEmailVerificationToUser = async () => {
    if (!user) throw new Error('No user logged in');
    return sendEmailVerification(user);
  };

  const logout = () => signOut(auth);

  return {
    user,
    userData,
    loading,
    login,
    register,
    verifyOTP,
    sendPhoneOTP,
    linkEmailToAccount,
    linkPhoneToAccount,
    resetPassword,
    resetPasswordWithPhone,
    updateUserPassword,
    sendEmailVerificationToUser,
    logout,
    initRecaptcha
  };
};