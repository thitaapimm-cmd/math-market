"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playSpeech, stopSpeech } from "@/lib/speech";

export function useLessonAudio(prompt: string, promptKey: string, enabled: boolean) {
  const [locked, setLocked] = useState(true);
  const [speakingKey, setSpeakingKey] = useState("");
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const busy = useRef(true);
  const sequence = useRef(0);

  const say = useCallback(async (text: string) => {
    const current = ++sequence.current;
    busy.current = true;
    setSpeakingKey(promptKey);
    setLocked(true);
    setAudioUnavailable(false);
    const result = await playSpeech(text);
    if (sequence.current === current) {
      busy.current = false;
      setLocked(false);
      setAudioUnavailable(result === "unavailable");
    }
    return result;
  }, [promptKey]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    queueMicrotask(() => { if (active) void say(prompt); });
    return () => {
      active = false;
      sequence.current += 1;
      stopSpeech();
      busy.current = true;
    };
    // promptKey marks a new question or step; prompt text is captured for that step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, promptKey, say]);

  const replay = useCallback(() => {
    if (!enabled || busy.current) return;
    void say(prompt);
  }, [enabled, prompt, say]);

  return {
    locked: locked || speakingKey !== promptKey,
    isBusy: () => busy.current || speakingKey !== promptKey,
    say,
    replay,
    audioUnavailable,
  };
}
