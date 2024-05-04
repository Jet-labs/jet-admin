import { LOCAL_CONSTANTS } from "../../constants";

export class ServerSideErrorSocketConnection {
  constructor({ socket, callback }) {
    this.socket = socket;
    this.callback = callback;

    this.socket?.on(
      LOCAL_CONSTANTS.SOCKET_EVENTS.ON_SERVER_SIDE_ERROR,
      ({ error, type }) => {
        if (!error || error === undefined || error === null) {
          callback(null);
        } else {
          callback({ error, type });
        }
      }
    );
  }
  unsubscribe() {
    this.socket?.off(LOCAL_CONSTANTS.SOCKET_EVENTS.ON_SERVER_SIDE_ERROR);
  }
}
