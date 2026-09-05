import { storage } from '../storage.js';

const dmKey = (uid1, uid2) => `chat:dm:${[uid1, uid2].sort().join(':')}`;
const groupKey = () => `chat:group`;
const customGroupsKey = (userId) => `chat:customGroups:${userId}`;
const customGroupMsgKey = (gid) => `chat:custom:${gid}`;
const readKey = (userId, convKey) => `chat:read:${userId}:${convKey}`;

export function getLastRead(userId, convKey) {
  try { return parseInt(localStorage.getItem(readKey(userId, convKey)) || '0', 10); } catch { return 0; }
}

export async function loadCustomGroups(userId) {
  try {
    const res = await storage.get(customGroupsKey(userId));
    return res ? JSON.parse(res.value) : [];
  } catch { return []; }
}

export async function getUnreadCounts(userId, friends) {
  const convs = [
    { key: groupKey(), label: 'Group' },
    ...(friends || []).map(f => ({ key: dmKey(userId, f.id), label: f.name })),
  ];
  try {
    const cg = await loadCustomGroups(userId);
    cg.forEach(g => convs.push({ key: customGroupMsgKey(g.id), label: g.name }));
  } catch {}

  const results = [];
  for (const conv of convs) {
    const lr = getLastRead(userId, conv.key);
    try {
      const res = await storage.get(conv.key);
      const msgs = res ? JSON.parse(res.value) : [];
      const unread = msgs.filter(m => m.userId !== userId && m.ts > lr).length;
      if (unread > 0) results.push({ key: conv.key, label: conv.label, unread });
    } catch {}
  }
  return results;
}
