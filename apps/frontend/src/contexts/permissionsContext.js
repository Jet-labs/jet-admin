import React, { useState } from "react";
import { useEffect } from "react";

const PermissionsStateContext = React.createContext(undefined);
const PermissionsActionContext = React.createContext(undefined);

const PermissionContextProvider = ({ children }) => {
  const [geolocationPermission, setGeolocationPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    requesGeolocationPermission();
    requesNotificationPermission();
  }, []);

  const requesGeolocationPermission = () => {
    navigator.permissions.query({ name: "notifications" }).then((permission) => {
      if (permission.state === "granted") {
        setGeolocationPermission(true);
      } else if (permission.state === "prompt") {
        setGeolocationPermission(false);
      } else {
        setGeolocationPermission(false);
      }
    });
  };

  const requesNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notification");
      setNotificationPermission(false);
    } else if (Notification.permission === "granted") {
      setNotificationPermission(true);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationPermission(true);
        } else {
          setNotificationPermission(false);
        }
      });
    }
  };

  return (
    <PermissionsStateContext.Provider value={{ geolocationPermission, notificationPermission }}>
      <PermissionsActionContext.Provider value={{ requesNotificationPermission, requesGeolocationPermission }}>{children}</PermissionsActionContext.Provider>
    </PermissionsStateContext.Provider>
  );
};

const usePermissionState = () => {
  const context = React.useContext(PermissionsStateContext);
  if (context === undefined) {
    throw new Error("usePermissionState error");
  }

  return context;
};

const usePermissionActions = () => {
  const context = React.useContext(PermissionsActionContext);
  if (context === undefined) {
    throw new Error("usePermissionActions error");
  }

  return context;
};

export { usePermissionState, usePermissionActions, PermissionContextProvider };
