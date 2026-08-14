"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { UserT } from "@/lib/types";

interface UserContextValue {
  user: UserT | null;
  allUsers: UserT[];
  loading: boolean;
  isHostMode: boolean;
  setIsHostMode: (v: boolean) => void;
  switchUser: (id: number) => Promise<void>;
  becomeHost: () => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserT | null>(null);
  const [allUsers, setAllUsers] = useState<UserT[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHostMode, setIsHostModeState] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const users = await api.get<UserT[]>("/api/users");
      setAllUsers(users);
      const storedId = localStorage.getItem("airhome_user_id");
      let active = users.find((u) => String(u.id) === storedId);
      if (!active && users.length) {
        active = users.find((u) => !u.is_host) || users[0];
        localStorage.setItem("airhome_user_id", String(active.id));
      }
      setUser(active || null);
      const storedMode = localStorage.getItem("airhome_host_mode");
      setIsHostModeState(storedMode === "true" && !!active?.is_host);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const switchUser = async (id: number) => {
    localStorage.setItem("airhome_user_id", String(id));
    await refresh();
  };

  const becomeHost = async () => {
    const updated = await api.post<UserT>("/api/users/me/become-host");
    setUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const setIsHostMode = (v: boolean) => {
    localStorage.setItem("airhome_host_mode", String(v));
    setIsHostModeState(v);
  };

  return (
    <UserContext.Provider
      value={{ user, allUsers, loading, isHostMode, setIsHostMode, switchUser, becomeHost, refresh }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
