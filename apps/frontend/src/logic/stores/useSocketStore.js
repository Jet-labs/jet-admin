import { create } from "zustand";
import { io } from "socket.io-client";
import { CONSTANTS } from "../../constants";
import { firebaseAuth } from "../../config/firebase";

export const useSocketStore = create((set, get) => ({
  socket: null,

  connectSocket: async (user = firebaseAuth.currentUser) => {
    if (!user) {
      console.error("No user available to connect socket");
      return;
    }

    try {
      const bearerToken = await user.getIdToken();
      const newSocket = io(CONSTANTS.SOCKET_HOST, {
        auth: { token: bearerToken },
      });

      newSocket.on("reconnecting", async () => {
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken();
          newSocket.auth.token = newToken;
        }
      });

      console.log("Socket connected:", newSocket);
      set({ socket: newSocket });
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
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
