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
  GoogleAuthProvider,
  signInWithPopup,
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

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        // Existing user - nothing more to do, auth state listener will handle redirect
        return { user: firebaseUser, exists: true };
      }

      // New OAuth user - return prefill data for registration
        const prefill = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          emailVerified: !!firebaseUser.emailVerified
        };

        try {
          // Persist prefill so a remounted AuthForms can read it after app-state changes
          localStorage.setItem('oauth_prefill', JSON.stringify(prefill));
        } catch (e) {
          // ignore storage errors
        }

        return {
          user: firebaseUser,
          exists: false,
          prefill
        };
    } catch (error: any) {
      console.error('Google sign-in failed', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    console.log('Registration attempt with data:', { ...data, password: '[HIDDEN]' });

    // Basic uniqueness checks for email, username, phone
    try {
      if (data.email) {
        const q = query(collection(db, 'users'), where('email', '==', data.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          // If the existing doc belongs to the current auth user, it's fine
          if (!(auth.currentUser && snap.docs[0].id === auth.currentUser.uid)) {
            const err: any = new Error('Email already in use');
            err.code = 'auth/email-already-in-use';
            throw err;
          }
        }
      }

      if (data.username) {
        const q2 = query(collection(db, 'users'), where('userName', '==', data.username));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          if (!(auth.currentUser && snap2.docs[0].id === auth.currentUser.uid)) {
            const err: any = new Error('Username already in use');
            err.code = 'auth/username-already-in-use';
            throw err;
          }
        }
      }

      if (data.phone) {
        const q3 = query(collection(db, 'users'), where('phone', '==', data.phone));
        const snap3 = await getDocs(q3);
        if (!snap3.empty) {
          if (!(auth.currentUser && snap3.docs[0].id === auth.currentUser.uid)) {
            const err: any = new Error('Phone already in use');
            err.code = 'auth/phone-already-in-use';
            throw err;
          }
        }
      }
    } catch (e) {
      throw e;
    }

    // If there's already an authenticated user (e.g. Google sign-in), create/update Firestore doc
    if (auth.currentUser && auth.currentUser.email === data.email) {
      const current = auth.currentUser;
      console.log('Detected existing authenticated user during registration:', current.uid);

      // Update display name if needed
      try {
        await updateProfile(current, { displayName: data.name });
      } catch (e) {
        console.warn('Failed to update profile:', e);
      }

      const userDocData = {
        uid: current.uid,
        name: data.name,
        email: data.email,
        userName: data.username || null,
        phone: data.phone || null,
        userClass: data.class,
        listOfCourses: [],
        coins: 0,
        deviceId: data.deviceId || null,
        password: data.password || null,
        emailVerified: !!current.emailVerified,
        phoneVerified: false,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', current.uid), userDocData);

      // If the user provided a password during registration, link the email/password credential
      // to the existing OAuth user so they can sign in with email/password later.
      if (data.password) {
        try {
          const credential = EmailAuthProvider.credential(data.email!, data.password);
          await linkWithCredential(current, credential as any);
          // Reload the user to reflect new providers
          await current.reload();
          // Update user state if necessary
          console.log('Linked email/password to OAuth account');
        } catch (e: any) {
          console.warn('Failed to link email/password to OAuth account:', e);
          // propagate specific error for UI to handle if desired
          throw e;
        }
      }

      // If email is not verified but provider verified it (Google), update flag
      if (current.emailVerified) {
        try {
          await updateDoc(doc(db, 'users', current.uid), { emailVerified: true });
        } catch (e) {
          console.warn('Failed to update emailVerified in user doc:', e);
        }
      }

      return { user: current, requiresOTP: false };
    }

    // Standard email/password registration
    if (data.email && data.password) {
      console.log('Creating user with email and password');
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = result.user;
      console.log('User created successfully:', user.uid);

      await updateProfile(user, { displayName: data.name });

      const userData = {
        uid: user.uid,
        name: data.name,
        email: data.email,
        userName: data.username || null,
        phone: data.phone || null,
        userClass: data.class,
        listOfCourses: [],
        coins: 0,
        deviceId: data.deviceId || null,
        password: data.password,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // Send email verification
      try {
        await sendEmailVerification(user);
        console.log('Email verification sent');
      } catch (error) {
        console.error('Failed to send email verification:', error);
      }

      return { user, requiresOTP: false };
    }

    throw new Error('Email and password are required');
  };

  const verifyOTP = async (confirmationResult: any, otp: string, userData?: RegisterData) => {
    const result = await confirmationResult.confirm(otp);
    
    // If this is registration (userData provided), create Firebase user
    if (userData) {
      console.log('Creating Firebase user after mock phone verification...');
      
      // Create Firebase user with email/password
      if (userData.email && userData.password) {
        const firebaseResult = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const firebaseUser = firebaseResult.user;
        
        await updateProfile(firebaseUser, { displayName: userData.name });
        
        const userDocData = {
          uid: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          userName: userData.username || null,
          phone: userData.phone || null,
          userClass: userData.class,
          listOfCourses: [],
          coins: 0,
          deviceId: userData.deviceId || null,
          password: userData.password,
          emailVerified: false,
          phoneVerified: true, // Mock verified
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), userDocData);
        console.log('User document created after mock phone verification');
        
        // Send email verification
        try {
          await sendEmailVerification(firebaseUser);
          console.log('Email verification sent');
        } catch (error) {
          console.error('Failed to send email verification:', error);
        }
        
        return { user: firebaseUser };
      } else {
        throw new Error('Email and password required for registration');
      }
    }
    
    return result;
  };

  const linkEmailToAccount = async (email: string, password: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // Create the email credential
      const credential = EmailAuthProvider.credential(email, password);
      
      // Attempt to link the credential
      const result = await linkWithCredential(user, credential);
      
      // Update the user document
      await updateDoc(doc(db, 'users', user.uid), {
        email: email,
        emailVerified: false
      });
      
      // Send email verification
      await sendEmailVerification(result.user);
      
      return result;
    } catch (error: any) {
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This email is already registered with another account. Please use a different email address.');
      }
      throw error;
    }
  };

  const sendPhoneOTP = async (phoneNumber: string) => {
    try {
      // Mock OTP system - generate a fixed OTP for demo
      const mockOTP = '123456';
      console.log(`Mock OTP for ${phoneNumber}: ${mockOTP}`);
      
      // Return a mock confirmation result
      const mockConfirmationResult = {
        confirm: async (otp: string) => {
          if (otp === mockOTP) {
            // Create a mock user result
            return {
              user: {
                uid: `mock_${Date.now()}`,
                phoneNumber: phoneNumber,
                displayName: null
              }
            };
          } else {
            throw new Error('Invalid OTP');
          }
        }
      };
      
      return mockConfirmationResult;
    } catch (error: any) {
      console.error('Error with mock OTP:', error);
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
    
    // Reload user to get fresh status
    await user.reload();
    
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    await sendEmailVerification(user);
    console.log('Manual email verification sent');
  };

  const refreshUser = async () => {
    if (!user) return;
    await user.reload();
    // Update local user state so UI reacts to emailVerified changes
    const current = auth.currentUser;
    if (current) {
      setUser(current);
      console.log('User reloaded, emailVerified:', current.emailVerified);
    }
  };

  const enrollInCourse = async (courseName: string) => {
    if (!user) throw new Error('No user logged in');
    
    console.log('ENROLLMENT CALLED FOR:', courseName);
    console.log('Current enrolled courses:', userData?.listOfCourses);
    
    // Check if already enrolled
    if (userData?.listOfCourses?.includes(courseName)) {
      console.log('User already enrolled in:', courseName);
      return;
    }
    
    const updatedCourses = [...(userData?.listOfCourses || []), courseName];
    console.log('Updating courses to:', updatedCourses);
    
    await updateDoc(doc(db, 'users', user.uid), {
      listOfCourses: updatedCourses
    });
    
    console.log('Successfully enrolled in course:', courseName);
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
    signInWithGoogle,
    resetPassword,
    resetPasswordWithPhone,
    updateUserPassword,
    sendEmailVerificationToUser,
    refreshUser,
    enrollInCourse,
    logout,
    initRecaptcha
  };
};