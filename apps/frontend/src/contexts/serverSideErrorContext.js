import React, { useEffect } from "react";
import { ServerSideErrorSocketConnection } from "../models/socket/ServerSideErrorSocketConnection";
import { useSocketState } from "./socketContext";

const ServerSideErrorStateContext = React.createContext(undefined);
const ServerSideErrorActionsContext = React.createContext(undefined);

const ServerSideErrorContextProvider = ({ children }) => {
  const { socket } = useSocketState();

  useEffect(() => {
    let serverSideErrorSocketConnection;
    if (socket) {
      serverSideErrorSocketConnection = new ServerSideErrorSocketConnection({
        socket,
        callback: onServerSideErrorUpdate,
      });
    }
    return () => {
      serverSideErrorSocketConnection?.unsubscribe();
    };
  }, [socket]);

  const onServerSideErrorUpdate = ({ type, error }) => {
    if (error && type) {
    }
  };
  return (
    <ServerSideErrorStateContext.Provider>
      <ServerSideErrorActionsContext.Provider>
        {children}
      </ServerSideErrorActionsContext.Provider>
    </ServerSideErrorStateContext.Provider>
  );
};

const useServerSideErrorState = () => {
  const context = React.useContext(ServerSideErrorStateContext);
  if (context === undefined) {
    throw new Error("useServerSideErrorState error");
  }

  return context;
};

const useServerSideErrorActions = () => {
  const context = React.useContext(ServerSideErrorActionsContext);
  if (context === undefined) {
    throw new Error("useServerSideErrorActions error");
  }

  return context;
};

export {
  ServerSideErrorContextProvider,
  useServerSideErrorActions,
  useServerSideErrorState,
};
