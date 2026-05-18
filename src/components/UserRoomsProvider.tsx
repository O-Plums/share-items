"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useDashboardFetch } from "@/lib/client";

export type UserRoom = { id: string; label: string; emoji: string };

type CtxValue = {
  rooms: UserRoom[];
  loaded: boolean;
  refresh: () => Promise<void>;
  addRoom: (room: UserRoom) => void;
};

const Ctx = createContext<CtxValue | null>(null);

export function UserRoomsProvider({ children }: { children: React.ReactNode }) {
  const authedFetch = useDashboardFetch();
  const [rooms, setRooms] = useState<UserRoom[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await authedFetch<{ rooms: UserRoom[] }>("/api/rooms");
      setRooms(data.rooms);
    } catch {
      setRooms([]);
    } finally {
      setLoaded(true);
    }
  }, [authedFetch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addRoom = useCallback((room: UserRoom) => {
    setRooms((prev) => {
      if (prev.some((r) => r.id === room.id)) return prev;
      return [...prev, room].sort((a, b) => a.label.localeCompare(b.label));
    });
  }, []);

  return (
    <Ctx.Provider value={{ rooms, loaded, refresh, addRoom }}>{children}</Ctx.Provider>
  );
}

export function useUserRooms() {
  const ctx = useContext(Ctx);
  if (!ctx) return { rooms: [] as UserRoom[], loaded: true, refresh: async () => {}, addRoom: () => {} };
  return ctx;
}
