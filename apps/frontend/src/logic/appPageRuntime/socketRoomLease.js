const roomsBySocket = new WeakMap();

// Multiple aliases/observers may share a room. Disposing one must not detach
// the others. Keep the original socket, including when the store replaces it.
export function retainSocketRoom(socket, room, { event = 'join_room', payload = room, onJoin } = {}) {
  let rooms = roomsBySocket.get(socket);
  if (!rooms) { rooms = new Map(); roomsBySocket.set(socket, rooms); }
  let entry = rooms.get(room);
  if (!entry) {
    entry = { owners: new Set(), join: null };
    entry.join = () => socket.emit(event, payload, acknowledgement => {
      for (const owner of entry.owners) owner.onJoin?.(acknowledgement);
    });
    rooms.set(room, entry);
    socket.on('connect', entry.join);
  }
  const owner = { onJoin };
  entry.owners.add(owner);
  if (entry.owners.size === 1) entry.join();
  return () => {
    if (!entry.owners.delete(owner)) return;
    if (entry.owners.size) return;
    socket.off('connect', entry.join);
    socket.emit('leave_room', room);
    rooms.delete(room);
  };
}
