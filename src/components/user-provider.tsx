"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface UserCtx {
  username: string | null;
  displayName: string;
  avatar: string;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => void;
}

const UserContext = createContext<UserCtx>({
  username: null, displayName: "", avatar: "", isAdmin: false, loading: true, refresh: () => {}
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.loggedIn) {
        setUsername(data.username);
        setDisplayName(data.displayName || data.username);
        setAvatar(data.avatar || "");
        setIsAdmin(data.isAdmin || false);
      } else {
        setUsername(null);
        setDisplayName("");
        setAvatar("");
        setIsAdmin(false);
      }
    } catch {
      setUsername(null);
      setDisplayName("");
      setAvatar("");
      setIsAdmin(false);
    }
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  return (
    <UserContext.Provider value={{ username, displayName, avatar, isAdmin, loading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
