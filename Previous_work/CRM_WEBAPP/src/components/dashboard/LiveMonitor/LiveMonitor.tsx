"use client";

import React, { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import "@livekit/components-styles";
import styles from './LiveMonitor.module.css';

interface LiveMonitorProps {
  roomName: string;
  userId: string;
}

export function LiveMonitor({ roomName, userId }: LiveMonitorProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`/api/livekit/token?room=${roomName}&identity=${userId}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [roomName, userId]);

  if (!token) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Connecting to LiveKit Room: {roomName}...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      className={styles.roomContainer}
    >
      <div className={styles.header}>
        <h3>Live Call Monitor: {roomName}</h3>
        <div className={styles.statusBadge}>LIVE</div>
      </div>
      
      <div className={styles.monitorGrid}>
        <VideoConference />
        <RoomAudioRenderer />
      </div>

      <div className={styles.footer}>
        <ControlBar />
      </div>
    </LiveKitRoom>
  );
}
