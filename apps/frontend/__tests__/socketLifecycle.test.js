import { useSocketStore } from '../src/logic/stores/useSocketStore';
import { io } from 'socket.io-client';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));
jest.mock('../src/constants', () => ({ CONSTANTS: { SOCKET_HOST: 'http://test.invalid' } }));
jest.mock('../src/config/firebase', () => ({ firebaseAuth: { currentUser: null, onAuthStateChanged: jest.fn() } }));

describe('shared socket authentication lifecycle', () => {
  let socket;
  beforeEach(() => {
    useSocketStore.getState().disconnectSocket();
    jest.clearAllMocks();
    socket = { connect: jest.fn(), disconnect: jest.fn() };
    io.mockReturnValue(socket);
  });
  test('logout while token is pending cannot resurrect a socket', async () => {
    let resolve;
    const pending = useSocketStore.getState().connectSocket({ uid: 'u', getIdToken: () => new Promise(yes => { resolve = yes; }) });
    useSocketStore.getState().disconnectSocket();
    resolve('late-token');
    await pending;
    expect(io).not.toHaveBeenCalled();
    expect(useSocketStore.getState().socket).toBeNull();
  });
  test('older login cannot replace newer user connection', async () => {
    let resolve;
    const old = useSocketStore.getState().connectSocket({ uid: 'old', getIdToken: () => new Promise(yes => { resolve = yes; }) });
    await useSocketStore.getState().connectSocket({ uid: 'new', getIdToken: async () => 'new-token' });
    resolve('old-token');
    await old;
    expect(io).toHaveBeenCalledTimes(1);
    expect(useSocketStore.getState().socketUserID).toBe('new');
  });
  test('repeated connects for the same user reuse one socket', async () => {
    const user = { uid: 'u', getIdToken: async () => 'token' };
    await useSocketStore.getState().connectSocket(user);
    await useSocketStore.getState().connectSocket(user);
    expect(io).toHaveBeenCalledTimes(1);
  });
  test('authentication callback fetches a fresh token for every reconnect', async () => {
    const user = { uid: 'u', getIdToken: jest.fn().mockResolvedValueOnce('initial').mockResolvedValueOnce('refresh-one').mockResolvedValueOnce('refresh-two') };
    await useSocketStore.getState().connectSocket(user);
    const options = io.mock.calls[0][1];
    await expect(new Promise(done => options.auth(done))).resolves.toEqual({ token: 'refresh-one' });
    await expect(new Promise(done => options.auth(done))).resolves.toEqual({ token: 'refresh-two' });
    expect(socket.connect).toHaveBeenCalledTimes(1);
  });
});
