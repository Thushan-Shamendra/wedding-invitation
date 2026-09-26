"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music, AlertCircle } from "lucide-react";

interface MusicPlayerProps {
  url: string;
  title?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export function MusicPlayer({ url, title, theme }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const primaryColor = theme?.primaryColor || "#C9A96E";
  const secondaryColor = theme?.secondaryColor || "#D8B4A0";
  const textColor = theme?.textColor || "#26231F";
  const displayTitle = title?.trim() || "Wedding Music";

  useEffect(() => {
    if (!url) return;

    // Reset state on URL change
    setHasError(false);
    setIsPlaying(false);

    // Initialize Audio
    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.warn("Could not load audio track at:", url);
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    // Clean up safely on unmount or URL change
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [url]);

  const togglePlay = async () => {
    if (!audioRef.current || hasError) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (err) {
      console.warn("Playback error or autoplay blocked:", err);
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  if (!url) return null;

  return (
    <aside
      aria-label="Background wedding music player"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 transition-all duration-300"
    >
      <div
        className="flex items-center gap-2.5 p-2 bg-white/95 backdrop-blur-md rounded-full border shadow-lg transition-all duration-300"
        style={{ borderColor: secondaryColor }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Play / Pause Main Trigger */}
        <button
          type="button"
          onClick={togglePlay}
          disabled={hasError}
          aria-label={
            hasError
              ? "Audio could not be loaded"
              : isPlaying
              ? "Pause background music"
              : "Play background music"
          }
          className="relative w-11 h-11 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {hasError ? (
            <AlertCircle className="w-5 h-5 text-white/90" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}

          {/* Equalizer animation ring when playing */}
          {isPlaying && (
            <span
              className="absolute inset-0 rounded-full border-2 animate-ping pointer-events-none opacity-40"
              style={{ borderColor: primaryColor }}
            />
          )}
        </button>

        {/* Track Title and Wave Info (shown on hover or when playing) */}
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
            isExpanded || isPlaying ? "max-w-[220px] px-2 opacity-100" : "max-w-0 px-0 opacity-0"
          }`}
        >
          <div className="flex flex-col min-w-0 pr-1">
            <span
              className="text-xs font-medium truncate max-w-[130px] leading-tight"
              style={{ color: textColor }}
            >
              {hasError ? "Unable to load audio" : displayTitle}
            </span>
            <span className="text-[10px] text-[#746E66] flex items-center gap-1">
              {hasError ? (
                "Check audio source"
              ) : isPlaying ? (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Playing music
                </>
              ) : (
                "Click to play"
              )}
            </span>
          </div>

          {/* Mini Soundwave visualizer */}
          {isPlaying && !hasError && (
            <div className="flex items-end gap-0.5 h-3.5 shrink-0 px-0.5" aria-hidden="true">
              <span
                className="w-0.5 bg-[#C9A96E] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"
                style={{ height: "60%", backgroundColor: primaryColor }}
              />
              <span
                className="w-0.5 bg-[#C9A96E] rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.2s]"
                style={{ height: "100%", backgroundColor: primaryColor }}
              />
              <span
                className="w-0.5 bg-[#C9A96E] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.4s]"
                style={{ height: "45%", backgroundColor: primaryColor }}
              />
              <span
                className="w-0.5 bg-[#C9A96E] rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.1s]"
                style={{ height: "80%", backgroundColor: primaryColor }}
              />
            </div>
          )}

          {/* Mute / Unmute Button */}
          {!hasError && (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="p-1 rounded-full text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] transition-colors cursor-pointer shrink-0"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
