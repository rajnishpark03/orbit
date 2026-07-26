'use client';

import { createContext, useContext } from 'react';
import { useScreenShare } from '@/hooks/use-screen-share';
import { useSync } from '@/providers/sync-provider';

type ScreenShareValue = ReturnType<typeof useScreenShare> & { active: boolean };

const ScreenShareContext = createContext<ScreenShareValue | null>(null);

/**
 * One app-wide screen-share session, so the Sync screen can read whether it's
 * active (to hoist it to the top) without spinning up a second WebRTC mesh.
 * Peers are the other people currently in the room.
 */
export function ScreenShareProvider({ children }: { children: React.ReactNode }) {
  const { members, deviceId } = useSync();
  const otherDeviceIds = members.filter((m) => m.deviceId !== deviceId).map((m) => m.deviceId);
  const screen = useScreenShare(otherDeviceIds);
  const active = screen.status === 'sharing' || screen.remoteStream !== null;
  return <ScreenShareContext.Provider value={{ ...screen, active }}>{children}</ScreenShareContext.Provider>;
}

export function useScreenShareCtx() {
  const ctx = useContext(ScreenShareContext);
  if (!ctx) throw new Error('useScreenShareCtx must be used within ScreenShareProvider');
  return ctx;
}
