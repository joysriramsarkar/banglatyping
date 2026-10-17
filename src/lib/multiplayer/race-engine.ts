/**
 * Multiplayer race engine — types + Supabase channel helpers.
 * No hard connection at import time; callers subscribe explicitly.
 */

import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

export interface PlayerState {
  userId: string;
  displayName: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishedAt?: string;
}

export interface RaceRoom {
  id: string;
  targetText: string;
  players: Record<string, PlayerState>;
  status: 'waiting' | 'racing' | 'finished';
  startsAt?: string;
}

export function raceChannelName(roomId: string): string {
  return `race:${roomId}`;
}

export function subscribeToRace(
  supabase: SupabaseClient,
  roomId: string,
  onState: (room: RaceRoom) => void,
  onPlayerUpdate: (player: PlayerState) => void,
): RealtimeChannel {
  const channel = supabase.channel(raceChannelName(roomId));
  channel
    .on('broadcast', { event: 'room-state' }, (msg) => {
      onState(msg.payload as RaceRoom);
    })
    .on('broadcast', { event: 'player-update' }, (msg) => {
      onPlayerUpdate(msg.payload as PlayerState);
    })
    .subscribe();
  return channel;
}

export async function broadcastPlayerUpdate(
  channel: RealtimeChannel,
  player: PlayerState,
): Promise<void> {
  await channel.send({ type: 'broadcast', event: 'player-update', payload: player });
}

export async function broadcastRoomState(channel: RealtimeChannel, room: RaceRoom): Promise<void> {
  await channel.send({ type: 'broadcast', event: 'room-state', payload: room });
}

export default subscribeToRace;
