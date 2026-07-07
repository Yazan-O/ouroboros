"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MS_PER_ITERATION = 1200;

export type ReplayController = {
  total: number;
  index: number;
  visibleCount: number;
  playing: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (index: number) => void;
  step: (delta: number) => void;
  setSpeed: (speed: number) => void;
};

function normalizeTotal(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function normalizeSpeed(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function clampIndex(value: number, total: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(total, Math.max(0, value));
}

export function useReplay(totalIterations: number, initialSpeed = 1): ReplayController {
  const total = normalizeTotal(totalIterations);
  // Start at the end: the page loads fully caught-up; replay is opt-in (play restarts from 0).
  const [index, setIndex] = useState(() => normalizeTotal(totalIterations));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState(() => normalizeSpeed(initialSpeed));

  const frameRef = useRef<number | null>(null);
  const lastNowRef = useRef<number | null>(null);
  const indexRef = useRef(index);
  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const totalRef = useRef(total);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
  }, []);

  const seek = useCallback((nextIndex: number) => {
    const next = clampIndex(nextIndex, totalRef.current);
    indexRef.current = next;
    setIndex(next);
    if (next >= totalRef.current) {
      playingRef.current = false;
      setPlaying(false);
    }
  }, []);

  const play = useCallback(() => {
    const totalNow = totalRef.current;
    if (totalNow === 0) return;
    if (indexRef.current >= totalNow) {
      indexRef.current = 0;
      setIndex(0);
    }
    playingRef.current = true;
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (playingRef.current) {
      pause();
      return;
    }
    play();
  }, [pause, play]);

  const step = useCallback((delta: number) => {
    const next = clampIndex(Math.ceil(indexRef.current) + delta, totalRef.current);
    indexRef.current = next;
    setIndex(next);
    if (next >= totalRef.current) {
      playingRef.current = false;
      setPlaying(false);
    }
  }, []);

  const setSpeed = useCallback((nextSpeed: number) => {
    const next = normalizeSpeed(nextSpeed);
    speedRef.current = next;
    setSpeedState(next);
  }, []);

  useEffect(() => {
    totalRef.current = total;
    const next = clampIndex(indexRef.current, total);
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
    }
    if (total === 0 || next >= total) {
      playingRef.current = false;
      setPlaying(false);
    }
  }, [total]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    playingRef.current = playing;

    if (!playing) {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastNowRef.current = null;
      return;
    }

    if (totalRef.current === 0 || indexRef.current >= totalRef.current) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }

    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;

      const lastNow = lastNowRef.current ?? now;
      const elapsed = now - lastNow;
      lastNowRef.current = now;

      const next = clampIndex(
        indexRef.current + (elapsed / MS_PER_ITERATION) * speedRef.current,
        totalRef.current,
      );

      indexRef.current = next;
      setIndex(next);

      if (next >= totalRef.current) {
        playingRef.current = false;
        setPlaying(false);
        frameRef.current = null;
        lastNowRef.current = null;
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastNowRef.current = null;
    };
  }, [playing]);

  const visibleCount = Math.min(total, Math.ceil(index));

  return useMemo(
    () => ({
      total,
      index,
      visibleCount,
      playing,
      speed,
      play,
      pause,
      toggle,
      seek,
      step,
      setSpeed,
    }),
    [total, index, visibleCount, playing, speed, play, pause, toggle, seek, step, setSpeed],
  );
}
