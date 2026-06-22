import React, { useState, useEffect, useCallback } from "react";
import { FONT, USERS, SESSION_KEY, PASSWORDS } from "./constants.js";
import { loadBooks } from "./lib/books.js";
import { loadTooltips } from "./lib/books.js";
import { loadDynamicUsers } from "./lib/users.js";
import { LoginScreen } from "./components/layout/LoginScreen.jsx";
import { TopNav } from "./components/layout/TopNav.jsx";
import { BookDashboard } from "./components/dashboard/BookDashboard.jsx";
import { MyBooksHome } from "./components/marginalia/MyBooksHome.jsx";
import { UserHome } from "./components/home/UserHome.jsx";

function parseLocation(userId) {
  const path = window.location.pathname;
  if (!userId) return { screen: "userHome", activeBookId: null };
  const base = `/${userId}`;
  if (path === `${base}/marginalia`) return { screen: "myBooks", activeBookId: null };
  const bookMatch = path.match(new RegExp(`^${base}/book/(.+)$`));
  if (bookMatch) return { screen: "userHome", activeBookId: bookMatch[1] };
  return { screen: "userHome", activeBookId: null };
}

export default function App() {
  const [loggedInUserId, setLoggedInUserId] = useState(() => localStorage.getItem(SESSION_KEY) || null);
  const [screen, setScreen] = useState(() => parseLocation(localStorage.getItem(SESSION_KEY) || null).screen);
  const [activeBookId, setActiveBookId] = useState(() => parseLocation(localStorage.getItem(SESSION_KEY) || null).activeBookId);
  const [booksVersion, setBooksVersion] = useState(0);
  const [allUserBooks, setAllUserBooks] = useState([]);
  const [booksReady, setBooksReady] = useState(false);
  const [dynamicUsers, setDynamicUsers] = useState([]);
  const [dynamicPasswords, setDynamicPasswords] = useState({});
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [tooltips, setTooltips] = useState({});

  const navigate = useCallback((nextScreen, nextBookId = null, userId = loggedInUserId) => {
    if (!userId) return;
    let path = `/${userId}`;
    if (nextBookId) path = `/${userId}/book/${nextBookId}`;
    else if (nextScreen === "myBooks") path = `/${userId}/marginalia`;
    window.history.pushState({ screen: nextScreen, activeBookId: nextBookId, userId }, "", path);
    setScreen(nextScreen);
    setActiveBookId(nextBookId);
    if (nextBookId) setBooksVersion((v) => v + 1);
  }, [loggedInUserId]);

  useEffect(() => {
    const onPop = (e) => {
      const userId = localStorage.getItem(SESSION_KEY);
      if (!userId) { setLoggedInUserId(null); return; }
      const { screen: s, activeBookId: b } = e.state || parseLocation(userId);
      setScreen(s || "userHome");
      setActiveBookId(b || null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    Promise.all([loadDynamicUsers(), loadTooltips()]).then(([{ dynamicUsers: du, dynamicPasswords: dp }, tt]) => {
      setDynamicUsers(du);
      setDynamicPasswords(dp);
      setTooltips(tt);
      setUsersLoaded(true);
    });
  }, []);

  const allPasswords = { ...PASSWORDS, ...dynamicPasswords };
  const activeUser = loggedInUserId ? USERS[loggedInUserId] : null;

  useEffect(() => {
    if (!loggedInUserId) { setAllUserBooks([]); setBooksReady(false); return; }
    loadBooks(loggedInUserId).then((books) => { setAllUserBooks(books); setBooksReady(true); });
  }, [loggedInUserId, booksVersion]);

  const staticBooks = activeUser ? activeUser.books : [];
  const activeBook = [...staticBooks, ...allUserBooks].find((b) => b.id === activeBookId);

  useEffect(() => {
    if (!booksReady || !activeBookId) return;
    const found = [...(activeUser?.books || []), ...allUserBooks].find((b) => b.id === activeBookId);
    if (!found) { setActiveBookId(null); setScreen("userHome"); }
  }, [booksReady, allUserBooks, activeBookId]);

  const handleLogin = (userId) => {
    setLoggedInUserId(userId);
    window.history.pushState({ screen: "userHome", activeBookId: null, userId }, "", `/${userId}`);
    setScreen("userHome");
    setActiveBookId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setLoggedInUserId(null);
    window.history.pushState({}, "", "/");
    setScreen("userHome");
    setActiveBookId(null);
  };

  const handleUserCreated = ({ dynamicUsers: du, dynamicPasswords: dp }) => {
    setDynamicUsers(du);
    setDynamicPasswords(dp);
  };

  if (!usersLoaded) return null;

  if (!loggedInUserId) {
    return <LoginScreen onLogin={handleLogin} allPasswords={allPasswords} />;
  }

  let content;
  if (activeBookId && !activeBook) {
    content = null;
  } else if (activeBook && activeUser) {
    content = <BookDashboard userId={activeUser.id} book={activeBook} onBack={() => navigate("userHome", null)} onLogout={handleLogout} />;
  } else if (screen === "myBooks" && activeUser) {
    content = <MyBooksHome userId={activeUser.id} userAccent={activeUser.accent} staticBooks={staticBooks}
      onSelect={(id) => navigate("userHome", id)} onBack={() => navigate("userHome", null)} onLogout={handleLogout}
      onBooksChanged={() => setBooksVersion((v) => v + 1)} />;
  } else if (activeUser) {
    content = <UserHome user={activeUser} onOpenMyBooks={() => navigate("myBooks")} onLogout={handleLogout}
      onBooksChanged={() => setBooksVersion((v) => v + 1)} dynamicUsers={dynamicUsers} dynamicPasswords={dynamicPasswords}
      onUserCreated={handleUserCreated} tooltips={tooltips} onTooltipsChanged={setTooltips} />;
  }

  return (
    <div style={{ fontFamily: FONT.body }}>
      <style>{`
        @media (max-width: 720px) { .casefile-grid { grid-template-columns: 1fr !important; } .quote-form { grid-template-columns: 1fr !important; } }
        * { box-sizing: border-box; }
      `}</style>
      <TopNav screen={screen} activeBook={activeBook} onNavigate={(key) => navigate(key)} onLogout={handleLogout} userName={activeUser?.name} />
      {content}
    </div>
  );
}
