import { storage } from '../storage.js';
import { USERS, DYNAMIC_USERS_KEY, DYNAMIC_PASSWORDS_KEY, DEFAULT_CONNECTIONS, ACCESS_STORAGE_KEY } from '../constants.js';

export function hasConnection(id1, id2, connections) {
  return connections.some(([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1));
}

export function getConnectedUsers(userId, connections) {
  return Object.values(USERS).filter((u) => u.id !== userId && hasConnection(userId, u.id, connections));
}

export async function loadConnections() {
  try {
    const res = await storage.get(ACCESS_STORAGE_KEY);
    return res ? JSON.parse(res.value) : DEFAULT_CONNECTIONS;
  } catch { return DEFAULT_CONNECTIONS; }
}

export async function saveConnections(connections) {
  try { await storage.set(ACCESS_STORAGE_KEY, JSON.stringify(connections)); } catch {}
}

export async function loadDynamicUsers() {
  try {
    const [usersRes, pwRes] = await Promise.all([
      storage.get(DYNAMIC_USERS_KEY),
      storage.get(DYNAMIC_PASSWORDS_KEY),
    ]);
    const dynamicUsers = usersRes ? JSON.parse(usersRes.value) : [];
    const dynamicPasswords = pwRes ? JSON.parse(pwRes.value) : {};
    // Merge into live USERS registry
    dynamicUsers.forEach((u) => { USERS[u.id] = { ...u, books: [] }; });
    return { dynamicUsers, dynamicPasswords };
  } catch { return { dynamicUsers: [], dynamicPasswords: {} }; }
}

export async function saveNewUser(newUser, password, existingDynamic, existingPasswords) {
  const updatedUsers = [...existingDynamic.filter((u) => u.id !== newUser.id), newUser];
  const updatedPasswords = { ...existingPasswords, [newUser.id]: password };
  await Promise.all([
    storage.set(DYNAMIC_USERS_KEY, JSON.stringify(updatedUsers)),
    storage.set(DYNAMIC_PASSWORDS_KEY, JSON.stringify(updatedPasswords)),
  ]);
  return { dynamicUsers: updatedUsers, dynamicPasswords: updatedPasswords };
}

export async function deleteDynamicUser(userId, existingDynamic, existingPasswords) {
  const updatedUsers = existingDynamic.filter((u) => u.id !== userId);
  const updatedPasswords = { ...existingPasswords };
  delete updatedPasswords[userId];
  await Promise.all([
    storage.set(DYNAMIC_USERS_KEY, JSON.stringify(updatedUsers)),
    storage.set(DYNAMIC_PASSWORDS_KEY, JSON.stringify(updatedPasswords)),
  ]);
  delete USERS[userId];
  return { dynamicUsers: updatedUsers, dynamicPasswords: updatedPasswords };
}
