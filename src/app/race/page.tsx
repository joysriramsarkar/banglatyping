"use client";

/**
 * Multiplayer race — create/join room, countdown → racing → finished.
 * Uses race-engine helpers. Realtime goes through a Supabase channel when
 * configured; otherwise it falls back to a local simulation with bot
 * opponents (see comment in `getChannel`).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getSupabase, getSupabaseUrl } from "@/lib/db";
import {
  broadcastPlayerUpdate,
  subscribeToRace,
  type PlayerState,
  type RaceRoom,
} from "@/lib/multiplayer/race-engine";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Phase = "lobby" | "countdown" | "racing" | "finished";

const RACE_TEXT = "বাংলা আমাদের অহংকার এবং মাতৃভাষা। দ্রুত নির্ভুল টাইপিং দক্ষতা আপনার সময় বাঁচায়।";
const BOT_NAMES = ["বট করিম", "বট রহিম"];

function makeId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function RacePage() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [roomId, setRoomId] = useState("");
  const [joinId, setJoinId] = useState("");
  const [displayName, setDisplayName] = useState("খেলোয়াড়");
  const [countdown, setCountdown] = useState(3);
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number>(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localId = useMemo(() => `local-${makeId()}`, []);

  // Supabase is only used when env is configured; otherwise the race runs
  // as a fully local simulation with bot opponents.
  function getChannel(id: string): RealtimeChannel | null {
    if (!getSupabaseUrl()) return null;
    try {
      return subscribeToRace(
        getSupabase(),
        id,
        (room: RaceRoom) => setPlayers(room.players),
        (player: PlayerState) =>
          setPlayers((prev) => ({ ...prev, [player.userId]: player }))
      );
    } catch {
      return null;
    }
  }

  useEffect(() => {
    return () => {
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, []);

  function seedPlayers(id: string, name: string): Record<string, PlayerState> {
    const seeded: Record<string, PlayerState> = {
      [localId]: { userId: localId, displayName: name, progress: 0, wpm: 0, accuracy: 100, finished: false },
    };
    BOT_NAMES.forEach((bot, i) => {
      const botId = `bot-${i}`;
      seeded[botId] = { userId: botId, displayName: bot, progress: 0, wpm: 0, accuracy: 100, finished: false };
    });
    void id;
    return seeded;
  }

  function startRoom(id: string) {
    const seeded = seedPlayers(id, displayName || "খেলোয়াড়");
    setPlayers(seeded);
    setTyped("");
    setPhase("countdown");
    setCountdown(3);
    channelRef.current?.unsubscribe();
    channelRef.current = getChannel(id);
  }

  // Countdown → racing.
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("racing");
      setStartedAt(Date.now());
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Bot simulation during racing.
  useEffect(() => {
    if (phase !== "racing") return;
    const t = setInterval(() => {
      setPlayers((prev) => {
        const next = { ...prev };
        for (const botId of Object.keys(next)) {
          if (!botId.startsWith("bot-") || next[botId].finished) continue;
          const progress = Math.min(1, next[botId].progress + Math.random() * 0.03);
          next[botId] = {
            ...next[botId],
            progress,
            wpm: 20 + Math.round(Math.random() * 15),
            finished: progress >= 1,
            finishedAt: progress >= 1 ? new Date().toISOString() : undefined,
          };
        }
        return next;
      });
    }, 800);
    return () => clearInterval(t);
  }, [phase]);

  function onType(value: string) {
    if (phase !== "racing") return;
    const target = RACE_TEXT.slice(0, value.length);
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === target[i]) correct++;
    }
    const progress = Math.min(1, value.length / RACE_TEXT.length);
    const minutes = Math.max((Date.now() - startedAt) / 60000, 1 / 60);
    const wpm = Math.round(value.length / 5 / minutes);
    const accuracy = value.length === 0 ? 100 : Math.round((correct / value.length) * 100);
    const me: PlayerState = {
      userId: localId,
      displayName: displayName || "খেলোয়াড়",
      progress,
      wpm,
      accuracy,
      finished: progress >= 1,
      finishedAt: progress >= 1 ? new Date().toISOString() : undefined,
    };
    setTyped(value);
    setPlayers((prev) => ({ ...prev, [localId]: me }));
    if (channelRef.current) void broadcastPlayerUpdate(channelRef.current, me);
    if (progress >= 1) setPhase("finished");
  }

  // If every racer finished, end the race.
  useEffect(() => {
    if (phase !== "racing") return;
    const list = Object.values(players);
    if (list.length > 0 && list.every((p) => p.finished)) setPhase("finished");
  }, [players, phase]);

  const standings = useMemo(
    () => Object.values(players).sort((a, b) => b.progress - a.progress),
    [players]
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-center">টাইপিং রেস</h1>

      {phase === "lobby" && (
        <Card>
          <CardHeader>
            <CardTitle>রুম তৈরি / যোগ দিন</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="আপনার নাম"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const id = makeId();
                  setRoomId(id);
                  startRoom(id);
                }}
              >
                নতুন রুম
              </Button>
              <Input
                value={joinId}
                onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                placeholder="রুম কোড"
              />
              <Button
                variant="outline"
                disabled={!joinId}
                onClick={() => {
                  setRoomId(joinId);
                  startRoom(joinId);
                }}
              >
                যোগ দিন
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase !== "lobby" && (
        <Card>
          <CardHeader>
            <CardTitle>
              রুম: {roomId} —{" "}
              {phase === "countdown" ? `শুরু হচ্ছে… ${countdown}` : phase === "racing" ? "দৌড় চলছে!" : "শেষ!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm p-3 rounded bg-muted">{RACE_TEXT}</p>
            {phase === "racing" && (
              <Textarea
                value={typed}
                onChange={(e) => onType(e.target.value)}
                placeholder="এখানে টাইপ করুন…"
                rows={3}
              />
            )}
            <div className="space-y-3">
              {standings.map((p, i) => (
                <div key={p.userId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      {i + 1}. {p.displayName} {p.userId === localId && "(আপনি)"}
                    </span>
                    <span className="text-muted-foreground">
                      {p.wpm} WPM · {p.accuracy}% {p.finished && "🏁"}
                    </span>
                  </div>
                  <Progress value={Math.round(p.progress * 100)} />
                </div>
              ))}
            </div>
            {phase === "finished" && (
              <Button onClick={() => setPhase("lobby")}>নতুন রেস</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
