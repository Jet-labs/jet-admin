import React, { createRef, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { LOCAL_CONSTANTS } from "../constants";

const SocketStateContext = React.createContext(undefined);
const SocketActionsContext = React.createContext(undefined);

const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, []);

  const connectSocket = (token) => {
    socket?.close();
    let newSocket = io(LOCAL_CONSTANTS.SERVER_HOST, {
      auth: {
        token,
      },
    });
    setSocket(newSocket);
  };

  return (
    <SocketStateContext.Provider value={{ socket }}>
      <SocketActionsContext.Provider value={{ connectSocket }}>
        {children}
      </SocketActionsContext.Provider>
    </SocketStateContext.Provider>
  );
};

const useSocketState = () => {
  const context = React.useContext(SocketStateContext);
  if (context === undefined) {
    throw new Error("useSocketState error");
  }

  return context;
};

const useSocketActions = () => {
  const context = React.useContext(SocketActionsContext);
  if (context === undefined) {
    throw new Error("useSocketActions error");
  }

  return context;
};

export { useSocketState, useSocketActions, SocketContextProvider };
