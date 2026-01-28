import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../constants";
import { io } from "socket.io-client";
import { firebaseAuth } from "../../config/firebase";

const SocketStateContext = React.createContext(undefined);
const SocketActionsContext = React.createContext(undefined);

const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    const _connectSocket = async (user = firebaseAuth.currentUser) => {
        if (!user) {
            console.error("No user available to connect socket");
            return;
        }

        try {
            const bearerToken = await user.getIdToken();
            const _socket = io(CONSTANTS.SOCKET_HOST, {
                auth: { token: bearerToken }
            });

            _socket.on("reconnecting", async () => {
                const currentUser = firebaseAuth.currentUser;
                if (currentUser) {
                    const newToken = await currentUser.getIdToken();
                    _socket.auth.token = newToken;
                }
            });

            console.log("Socket connected:", _socket);
            setSocket(_socket);
        } catch (error) {
            console.error("Socket connection error:", error);
        }
    };

    const _disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    useEffect(() => {
        const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                await _connectSocket(user);
            } else {
                _disconnectSocket();
            }
        });

        return () => {
            unsubscribe();
            _disconnectSocket();
        };
    }, []);

    return (
        <SocketStateContext.Provider value={{ socket }}>
            <SocketActionsContext.Provider value={{ setSocket }}>
                {children}
            </SocketActionsContext.Provider>
        </SocketStateContext.Provider>
    );
};

SocketContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

const useSocketState = () => {
    const context = React.useContext(SocketStateContext);
    if (context === undefined) {
        throw new Error("useSocketState must be used within a SocketContextProvider");
    }
    return context;
};

const useSocketActions = () => {
    const context = React.useContext(SocketActionsContext);
    if (context === undefined) {
        throw new Error("useSocketActions must be used within a SocketContextProvider");
    }
    return context;
};

export {
    SocketActionsContext,
    SocketContextProvider,
    SocketStateContext,
    useSocketActions,
    useSocketState
};