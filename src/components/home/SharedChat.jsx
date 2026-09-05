import React, { useState, useEffect, useRef } from 'react';
import { storage, subscribeToChatUpdates } from '../../storage.js';
import { BRAND, FONT, USERS } from '../../constants.js';
import { getLastRead, loadCustomGroups } from '../../lib/chat.js';

// Storage key helpers
const dmKey = (uid1, uid2) => `chat:dm:${[uid1, uid2].sort().join(':')}`;
const groupKey = () => `chat:group`;
const customGroupsKey = (userId) => `chat:customGroups:${userId}`;
const customGroupMsgKey = (gid) => `chat:custom:${gid}`;
const readKey = (userId, convKey) => `chat:read:${userId}:${convKey}`;

function setLastRead(userId, convKey) {
  const now = Date.now();
  try { localStorage.setItem(readKey(userId, convKey), String(now)); } catch {}
  return now;
}

async function saveCustomGroups(userId, groups) {
  await storage.set(customGroupsKey(userId), JSON.stringify(groups));
}

function useConv(storageKey) {
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    storage.get(storageKey).then((res) => {
      if (active) { setMessages(res ? JSON.parse(res.value) : []); setLoaded(true); }
    });
    const unsub = subscribeToChatUpdates(storageKey, (msgs) => { if (active) setMessages(msgs); });
    return () => { active = false; unsub(); };
  }, [storageKey]);

  const send = async (userId, text) => {
    const msg = { userId, text, ts: Date.now() };
    const updated = [...messages, msg];
    setMessages(updated);
    await storage.set(storageKey, JSON.stringify(updated));
    return updated;
  };

  return { messages, loaded, send };
}

function MessageBubble({ msg, isMe, accent }) {
  const sender = USERS[msg.userId];
  const time = new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 3 }}>
        <span style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: isMe ? accent : (sender?.accent || BRAND.tan) }}>
          {isMe ? 'You' : (sender?.name || msg.userId)}
        </span>
        <span style={{ fontFamily: FONT.body, fontSize: 10, color: 'rgba(242,239,235,.3)' }}>{time}</span>
      </div>
      <div style={{ maxWidth: '78%', padding: '8px 12px', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: isMe ? `${accent}33` : 'rgba(242,239,235,.08)', border: `1px solid ${isMe ? accent + '55' : 'rgba(242,239,235,.12)'}`, fontFamily: FONT.body, fontSize: 14, lineHeight: 1.5, color: BRAND.cream, wordBreak: 'break-word' }}>
        {msg.text}
      </div>
    </div>
  );
}

// New Group modal
function NewGroupModal({ friends, onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(new Set());

  const toggle = (id) => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const canCreate = name.trim() && selected.size >= 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(10,5,0,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: BRAND.espresso, border: '1px solid rgba(217,162,130,.2)', borderRadius: 10, padding: 24, width: '100%', maxWidth: 360, boxShadow: '0 16px 40px rgba(0,0,0,.5)' }}>
        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: BRAND.tan, marginBottom: 16 }}>New group chat</div>

        {/* Group name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(242,239,235,.45)', display: 'block', marginBottom: 6 }}>Group name</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Book Club, Summer Reads…"
            style={{ width: '100%', background: 'rgba(242,239,235,.06)', border: '1px solid rgba(217,162,130,.25)', borderRadius: 6, padding: '9px 12px', color: BRAND.cream, fontFamily: FONT.body, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Member picker */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(242,239,235,.45)', display: 'block', marginBottom: 8 }}>Add people</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(friends || []).map(f => {
              const on = selected.has(f.id);
              return (
                <button key={f.id} onClick={() => toggle(f.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: `1px solid ${on ? (f.accent || BRAND.tan) + '88' : 'rgba(217,162,130,.15)'}`, background: on ? `${f.accent || BRAND.tan}22` : 'rgba(242,239,235,.04)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}>
                  {/* Avatar */}
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: f.accent || BRAND.tan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontWeight: 600, fontSize: 14, color: BRAND.espresso, flexShrink: 0 }}>
                    {f.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontFamily: FONT.body, fontSize: 14, color: on ? BRAND.cream : 'rgba(242,239,235,.65)', flex: 1 }}>{f.name}</span>
                  {on && <span style={{ color: f.accent || BRAND.tan, fontSize: 16 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ background: 'none', border: '1px solid rgba(217,162,130,.25)', borderRadius: 6, padding: '8px 16px', color: 'rgba(242,239,235,.5)', fontFamily: FONT.body, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button disabled={!canCreate} onClick={() => canCreate && onCreate(name.trim(), [...selected])}
            style={{ background: canCreate ? BRAND.coral : 'rgba(242,92,92,.3)', border: 'none', borderRadius: 6, padding: '8px 18px', color: '#fff', fontFamily: FONT.body, fontSize: 13, fontWeight: 600, cursor: canCreate ? 'pointer' : 'default', transition: 'background .15s' }}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export function SharedChat({ activeUser, friends }) {
  const [activeTab, setActiveTab] = useState('group');
  const [customGroups, setCustomGroups] = useState([]);
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [lastReadMap, setLastReadMap] = useState({});
  const scrollRef = useRef(null);

  // Load custom groups on mount
  useEffect(() => {
    loadCustomGroups(activeUser.id).then(setCustomGroups);
  }, [activeUser.id]);

  // Build conversation list: group + DMs + custom groups
  const convs = [
    { key: groupKey(), label: 'Group', id: 'group', accent: BRAND.tan },
    ...(friends || []).map(f => ({ key: dmKey(activeUser.id, f.id), label: f.name, id: f.id, accent: f.accent || BRAND.tan })),
    ...customGroups.map(g => ({ key: customGroupMsgKey(g.id), label: g.name, id: g.id, accent: BRAND.coral, isCustom: true, memberIds: g.memberIds })),
  ];

  const activeConv = convs.find(c => c.id === activeTab) || convs[0];
  const { messages, loaded, send } = useConv(activeConv.key);

  // Load initial last-read timestamps
  useEffect(() => {
    const map = {};
    convs.forEach(c => { map[c.key] = getLastRead(activeUser.id, c.key); });
    setLastReadMap(map);
  }, [activeUser.id, customGroups.length]);

  useEffect(() => {
    if (!collapsed && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, collapsed, activeTab]);

  useEffect(() => {
    if (!collapsed) {
      const ts = setLastRead(activeUser.id, activeConv.key);
      setLastReadMap(m => ({ ...m, [activeConv.key]: ts }));
    }
  }, [activeTab, collapsed, activeConv.key, activeUser.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    await send(activeUser.id, text);
    const ts = setLastRead(activeUser.id, activeConv.key);
    setLastReadMap(m => ({ ...m, [activeConv.key]: ts }));
  };

  const handleCreateGroup = async (name, memberIds) => {
    const id = `g_${Date.now()}`;
    const newGroup = { id, name, memberIds, createdAt: Date.now() };
    const updated = [...customGroups, newGroup];
    setCustomGroups(updated);
    await saveCustomGroups(activeUser.id, updated);
    setShowNewGroup(false);
    setActiveTab(id);
  };

  const handleDeleteGroup = async (gid) => {
    const updated = customGroups.filter(g => g.id !== gid);
    setCustomGroups(updated);
    await saveCustomGroups(activeUser.id, updated);
    setActiveTab('group');
  };

  const tabStyle = (conv) => {
    const active = conv.id === activeTab;
    return {
      background: active ? `${conv.accent}33` : 'rgba(242,239,235,.06)',
      border: `1px solid ${active ? conv.accent + '88' : 'transparent'}`,
      color: active ? conv.accent : 'rgba(242,239,235,.5)',
      fontFamily: FONT.body, fontSize: 12, letterSpacing: '0.04em',
      textTransform: 'uppercase', padding: '5px 12px', borderRadius: 20,
      cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
    };
  };

  const placeholder = activeConv.id === 'group'
    ? 'Message everyone…'
    : activeConv.isCustom
      ? `Message ${activeConv.label}…`
      : `Message ${activeConv.label}…`;

  const emptyLabel = activeConv.id === 'group'
    ? 'No group messages yet — say hello!'
    : activeConv.isCustom
      ? `No messages in ${activeConv.label} yet`
      : `Start a conversation with ${activeConv.label}`;

  return (
    <>
      {showNewGroup && (
        <NewGroupModal
          friends={friends}
          onCreate={handleCreateGroup}
          onCancel={() => setShowNewGroup(false)}
        />
      )}

      <div style={{ width: '100%', background: 'rgba(20,12,4,.82)', backdropFilter: 'blur(10px)', border: '1px solid rgba(242,239,235,.1)', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: collapsed ? 'none' : '1px solid rgba(242,239,235,.08)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16 }}>💬</span>
          <span style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: BRAND.tan }}>Book Brain Chat</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {!collapsed && (
              <button onClick={() => setShowNewGroup(true)}
                title="New group chat"
                style={{ background: 'rgba(242,92,92,.15)', border: '1px solid rgba(242,92,92,.3)', color: BRAND.coral, borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: FONT.body, fontSize: 11, letterSpacing: '0.04em' }}>
                + New group
              </button>
            )}
            <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: '1px solid rgba(242,239,235,.18)', color: 'rgba(242,239,235,.45)', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: FONT.body, fontSize: 11 }}>
              {collapsed ? '▼ Open' : '▲ Close'}
            </button>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Conversation tabs */}
            <div style={{ display: 'flex', gap: 6, padding: '10px 16px 0', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {convs.map(conv => (
                <button key={conv.id} onClick={() => setActiveTab(conv.id)} style={tabStyle(conv)}>
                  {conv.label}
                </button>
              ))}
            </div>

            {/* Custom group info bar */}
            {activeConv.isCustom && (
              <div style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(242,239,235,.06)' }}>
                <span style={{ fontFamily: FONT.body, fontSize: 11, color: 'rgba(242,239,235,.35)' }}>
                  {activeConv.memberIds?.map(id => USERS[id]?.name || id).join(', ')}
                </span>
                <button onClick={() => handleDeleteGroup(activeConv.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.body, fontSize: 11, color: 'rgba(242,239,235,.3)', letterSpacing: '0.04em' }}
                  onMouseEnter={e => e.currentTarget.style.color = BRAND.coral}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(242,239,235,.3)'}>
                  Delete group
                </button>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} style={{ height: 240, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!loaded ? (
                <div style={{ fontFamily: FONT.body, fontSize: 12, color: 'rgba(242,239,235,.3)' }}>Loading…</div>
              ) : messages.length === 0 ? (
                <div style={{ fontFamily: FONT.body, fontSize: 13, color: 'rgba(242,239,235,.25)', fontStyle: 'italic', textAlign: 'center', marginTop: 24 }}>
                  {emptyLabel}
                </div>
              ) : (
                messages.map((m, i) => (
                  <MessageBubble key={i} msg={m} isMe={m.userId === activeUser.id} accent={activeUser.accent || BRAND.coral} />
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid rgba(242,239,235,.08)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={placeholder}
                style={{ flex: 1, background: 'rgba(20,12,4,.7)', border: '1px solid rgba(242,239,235,.18)', borderRadius: 20, padding: '8px 14px', color: BRAND.cream, fontFamily: FONT.body, fontSize: 14, outline: 'none' }}
              />
              <button type="submit" disabled={!input.trim()}
                style={{ background: `linear-gradient(135deg, ${activeUser.accent || BRAND.coral}, ${BRAND.terracotta})`, border: 'none', borderRadius: 20, padding: '8px 16px', color: BRAND.cream, fontFamily: FONT.body, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', opacity: input.trim() ? 1 : 0.4, transition: 'opacity .15s' }}>
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}

