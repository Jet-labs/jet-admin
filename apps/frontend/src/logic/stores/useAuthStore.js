import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth } from "../../config/firebase";

export const useAuthStore = create((set, get) => ({
  firebaseUserState: {
    isLoading: true,
    user: null,
    error: null,
  },
  signUpState: { isLoading: false, success: false, error: null },
  signInState: { isLoading: false, success: false, error: null },
  signOutState: { isLoading: false, success: false, error: null },
  passwordResetState: { isLoading: false, success: false, error: null },

  setFirebaseUserState: (state) => set({ firebaseUserState: state }),
  
  googleSignIn: async () => {
    try {
      const provider = new GoogleAuthProvider();
      set({ signInState: { isLoading: true, success: false, error: null } });
      await signInWithPopup(firebaseAuth, provider);
      set({ signInState: { isLoading: false, success: true, error: null } });
    } catch (error) {
      set({ signInState: { isLoading: false, success: false, error } });
    }
  },

  emailSignUp: async (email, password) => {
    try {
      set({ signUpState: { isLoading: true, success: false, error: null } });
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      set({ signUpState: { isLoading: false, success: true, error: null } });
    } catch (error) {
      set({ signUpState: { isLoading: false, success: false, error } });
    }
  },

  emailSignIn: async (email, password) => {
    try {
      set({ signInState: { isLoading: true, success: false, error: null } });
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      window.localStorage.setItem("emailForSignIn", email);
      set({ signInState: { isLoading: false, success: true, error: null } });
    } catch (error) {
      set({ signInState: { isLoading: false, success: false, error } });
    }
  },

  resetPassword: async (email) => {
    try {
      set({ passwordResetState: { isLoading: true, success: false, error: null } });
      await sendPasswordResetEmail(firebaseAuth, email);
      set({ passwordResetState: { isLoading: false, success: true, error: null } });
    } catch (error) {
      set({ passwordResetState: { isLoading: false, success: false, error } });
    }
  },

  signOut: async () => {
    try {
      set({ signOutState: { isLoading: true, success: false, error: null } });
      await firebaseAuth.signOut();
      set({ signOutState: { isLoading: false, success: true, error: null } });
      window.location.reload();
    } catch (error) {
      set({ signOutState: { isLoading: false, success: false, error } });
    }
  },
}));

// Initialize Firebase Auth listener
firebaseAuth.onAuthStateChanged(async (user) => {
  if (user) {
    useAuthStore.getState().setFirebaseUserState({ isLoading: false, error: null, user });
  } else {
    useAuthStore.getState().setFirebaseUserState({ isLoading: false, error: null, user: null });
  }
});
