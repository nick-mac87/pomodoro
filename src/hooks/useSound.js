import { useRef, useCallback } from "react";
import {
  createAudioContext,
  playRetroClick,
  playRetroComplete,
  playRetroStart,
  playRetroDelete,
  playRetroCelebration,
  playCleanClick,
  playCleanComplete,
  playCleanStart,
  playCleanDelete,
  playCleanCelebration,
} from "../utils/sounds.js";

export function useSound(isRetro) {
  const audioCtxRef = useRef(null);

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
  }, []);

  const playClick = useCallback(() => {
    ensureAudio();
    if (isRetro) playRetroClick(audioCtxRef.current);
    else playCleanClick(audioCtxRef.current);
  }, [isRetro, ensureAudio]);

  const playComplete = useCallback(() => {
    ensureAudio();
    if (isRetro) playRetroComplete(audioCtxRef.current);
    else playCleanComplete(audioCtxRef.current);
  }, [isRetro, ensureAudio]);

  const playStart = useCallback(() => {
    ensureAudio();
    if (isRetro) playRetroStart(audioCtxRef.current);
    else playCleanStart(audioCtxRef.current);
  }, [isRetro, ensureAudio]);

  const playDelete = useCallback(() => {
    ensureAudio();
    if (isRetro) playRetroDelete(audioCtxRef.current);
    else playCleanDelete(audioCtxRef.current);
  }, [isRetro, ensureAudio]);

  const playCelebration = useCallback(() => {
    ensureAudio();
    if (isRetro) playRetroCelebration(audioCtxRef.current);
    else playCleanCelebration(audioCtxRef.current);
  }, [isRetro, ensureAudio]);

  return { ensureAudio, playClick, playComplete, playStart, playDelete, playCelebration };
}
