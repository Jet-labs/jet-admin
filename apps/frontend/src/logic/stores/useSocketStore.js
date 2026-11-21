import { create } from "zustand";
import { io } from "socket.io-client";
import { CONSTANTS } from "../../constants";
import { firebaseAuth } from "../../config/firebase";

let connectionGeneration = 0;
export const useSocketStore = create((set, get) => ({
  socket: null,
  socketUserID: null,

  connectSocket: async (user = firebaseAuth.currentUser) => {
    if (!user) {
      get().disconnectSocket();
      return;
    }

    if (get().socket && get().socketUserID === user.uid) return get().socket;
    const generation = ++connectionGeneration;
    get().socket?.disconnect();
    set({ socket: null, socketUserID: null });

    try {
      const bearerToken = await user.getIdToken();
      if (generation !== connectionGeneration) return;
      const newSocket = io(CONSTANTS.SOCKET_HOST, {
        autoConnect: false,
        auth: (done) => {
          if (generation !== connectionGeneration) return done({ token: null });
          // Socket.IO calls auth on every connection/reconnection attempt.
          user.getIdToken().then(token => {
            done({ token: generation === connectionGeneration ? token : null });
          }).catch(() => done({ token: null }));
        },
      });
      // Do not publish stale identity if logout happened while acquiring a token.
      if (!bearerToken || generation !== connectionGeneration) { newSocket.disconnect(); return; }
      set({ socket: newSocket, socketUserID: user.uid });
      newSocket.connect();
      return newSocket;
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  },

  disconnectSocket: () => {
    connectionGeneration += 1;
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, socketUserID: null });
  },
}));

// Initialize socket listener
firebaseAuth.onAuthStateChanged(async (user) => {
  if (user) {
    await useSocketStore.getState().connectSocket(user);
  } else {
    useSocketStore.getState().disconnectSocket();
  }
});

// Helper hooks for backwards compatibility
export const useSocketState = () => {
  const socket = useSocketStore((state) => state.socket);
  return { socket };
};

export const useSocketActions = () => {
  const setSocket = (socket) => useSocketStore.setState({ socket });
  return { setSocket };
};
