"use client";

import React, { useEffect, useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Toast } from "@/components/ui/Toast";
import { weddingService } from "@/services/weddingService";
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Save,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Disc3,
  FileAudio,
} from "lucide-react";

interface MusicFormData {
  musicEnabled: boolean;
  musicTitle: string;
  backgroundMusicUrl: string;
}

const PRESET_TRACKS = [
  {
    title: "Gentle Wedding Theme (Local)",
    url: "/music/wedding-theme.wav",
    description: "Built-in soft harmonic chord chime from local public folder",
  },
  {
    title: "Canon in D - Acoustic Orchestral",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    description: "Classical romantic background arrangement",
  },
  {
    title: "Acoustic Sunset Melody",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    description: "Warm acoustic guitar ambient theme",
  },
];

export default function MusicManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<MusicFormData>({
    musicEnabled: false,
    musicTitle: "",
    backgroundMusicUrl: "",
  });

  const [initialData, setInitialData] = useState<MusicFormData | null>(null);

  // Audio Preview State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const wedding = await weddingService.getWeddingDetails();
        const initial: MusicFormData = {
          musicEnabled: wedding.musicEnabled ?? false,
          musicTitle: wedding.musicTitle ?? "",
          backgroundMusicUrl: wedding.backgroundMusicUrl ?? wedding.musicUrl ?? "",
        };
        setFormData(initial);
        setInitialData(initial);
      } catch (err) {
        console.error("Failed to load music settings:", err);
        setToast({
          message: "Failed to load music settings from server.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cleanup audio preview on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Handle URL change in Audio preview
  useEffect(() => {
    if (!formData.backgroundMusicUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setAudioError(null);
      return;
    }

    setAudioError(null);
    setAudioLoading(true);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(formData.backgroundMusicUrl);
    audio.preload = "metadata";
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setAudioLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setAudioLoading(false);
      setIsPlaying(false);
      setAudioError(
        "Could not load audio from the specified source. Please verify the URL or path format."
      );
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [formData.backgroundMusicUrl]);

  // Compute dirty state
  const isDirty =
    initialData !== null &&
    (formData.musicEnabled !== initialData.musicEnabled ||
      formData.musicTitle !== initialData.musicTitle ||
      formData.backgroundMusicUrl !== initialData.backgroundMusicUrl);

  // Play / Pause preview toggle
  const togglePlay = async () => {
    if (!audioRef.current || !formData.backgroundMusicUrl || audioError) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn("Audio playback error:", err);
      setIsPlaying(false);
      setAudioError("Browser blocked or could not play this audio file.");
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      togglePlay();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Reset to last saved state
  const handleReset = () => {
    if (!initialData) return;
    setFormData(initialData);
    setToast({
      message: "Reset all changes to last saved state.",
      type: "success",
    });
  };

  // Apply a preset track
  const handleApplyPreset = (preset: (typeof PRESET_TRACKS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      musicTitle: preset.title,
      backgroundMusicUrl: preset.url,
      musicEnabled: true,
    }));
    setToast({
      message: `Selected preset: "${preset.title}". Click Save to persist.`,
      type: "success",
    });
  };

  // Remove track
  const handleConfirmRemove = async () => {
    setIsRemoveModalOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);

    const clearedData: MusicFormData = {
      musicEnabled: false,
      musicTitle: "",
      backgroundMusicUrl: "",
    };

    setFormData(clearedData);

    try {
      setSaving(true);
      await weddingService.updateWeddingDetails(clearedData);
      setInitialData(clearedData);
      setToast({
        message: "Background music track removed and disabled successfully.",
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to remove track:", err);
      setToast({
        message: err.message || "Failed to remove background music.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save Settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Client validation
    if (formData.musicEnabled && !formData.backgroundMusicUrl.trim()) {
      setToast({
        message: "Please enter an audio URL or path before enabling music.",
        type: "error",
      });
      return;
    }

    if (formData.musicTitle.length > 150) {
      setToast({
        message: "Music title cannot exceed 150 characters.",
        type: "error",
      });
      return;
    }

    if (formData.backgroundMusicUrl.length > 2000) {
      setToast({
        message: "Music URL cannot exceed 2000 characters.",
        type: "error",
      });
      return;
    }

    try {
      setSaving(true);
      const res = await weddingService.updateWeddingDetails({
        musicEnabled: formData.musicEnabled,
        musicTitle: formData.musicTitle.trim(),
        backgroundMusicUrl: formData.backgroundMusicUrl.trim(),
      });

      const updatedData: MusicFormData = {
        musicEnabled: res.data.musicEnabled ?? formData.musicEnabled,
        musicTitle: res.data.musicTitle ?? formData.musicTitle,
        backgroundMusicUrl: res.data.backgroundMusicUrl ?? formData.backgroundMusicUrl,
      };

      setFormData(updatedData);
      setInitialData(updatedData);

      setToast({
        message: "Background music settings saved successfully!",
        type: "success",
      });
    } catch (err: any) {
      console.error("Save error:", err);
      setToast({
        message: err.message || "Failed to save background music settings.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Background Music">
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#746E66]">
            Loading Music Settings...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Background Music">
      <div className="space-y-6 pb-12">
        {/* Page Title Header */}
        <div className="pb-1 border-b border-[#E8E3DA]/80">
          <h2 className="text-2xl font-serif font-semibold text-[#26231F] tracking-tight">
            Background Music
          </h2>
          <p className="text-xs sm:text-sm text-[#746E66] mt-0.5">
            Manage background music, preview audio tracks, and configure playback settings for your wedding invitation.
          </p>
        </div>
        {/* Top Control Bar: Unsaved Indicator & Action Buttons */}
        <div className="bg-white rounded-2xl border border-[#E8E3DA] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#26231F]">
                  Music Configuration Status
                </h3>
                {isDirty && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="text-xs text-[#746E66]">
                {formData.musicEnabled
                  ? "Background music is enabled for public invitations"
                  : "Background music is currently turned off"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={!isDirty || saving || loading}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleSave()}
              isLoading={saving}
              loadingText="Saving..."
              disabled={loading}
              className="gap-1.5 text-xs min-w-[120px]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>

        {/* Main Grid: Settings & Audio Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Presets (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Enable / Disable Master Switch */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif font-semibold text-[#26231F]">
                      Enable Background Music
                    </h4>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        formData.musicEnabled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      }`}
                    >
                      {formData.musicEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-[#746E66] leading-relaxed">
                    When active, a subtle floating music player widget will be displayed on the invitation page for guests to enjoy.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.musicEnabled}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        musicEnabled: e.target.checked,
                      }))
                    }
                  />
                  <div className="w-12 h-6.5 bg-[#E8E3DA] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-[#D8B4A0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A96E]" />
                </label>
              </div>
            </div>

            {/* Track Settings Card */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DA]/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F8F6F1] border border-[#E8E3DA] flex items-center justify-center text-[#C9A96E]">
                    <FileAudio className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-serif font-semibold text-[#26231F]">
                    Audio Track Details
                  </h4>
                </div>

                {formData.backgroundMusicUrl && (
                  <button
                    type="button"
                    onClick={() => setIsRemoveModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Track</span>
                  </button>
                )}
              </div>

              {/* Track Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#26231F] flex items-center justify-between">
                  <span>Track Title / Song Name</span>
                  <span className="text-[11px] text-[#746E66]">
                    {formData.musicTitle.length}/150
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Canon in D - Pachelbel"
                  value={formData.musicTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      musicTitle: e.target.value,
                    }))
                  }
                  maxLength={150}
                />
                <p className="text-[11px] text-[#746E66]">
                  Displays inside the music widget player when guests hover or listen.
                </p>
              </div>

              {/* Music Source URL or Local Path */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#26231F] flex items-center justify-between">
                  <span>Audio Source URL or Local Path</span>
                  <span className="text-[11px] text-[#746E66]">
                    {formData.backgroundMusicUrl.length}/2000
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. /music/wedding-theme.wav or https://..."
                  value={formData.backgroundMusicUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      backgroundMusicUrl: e.target.value,
                    }))
                  }
                  maxLength={2000}
                />
                <div className="text-[11px] text-[#746E66] space-y-1 bg-[#F8F6F1] p-3 rounded-xl border border-[#E8E3DA]">
                  <p className="font-medium text-[#26231F] flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#C9A96E]" />
                    <span>Supported audio sources:</span>
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>
                      <strong>Local file</strong>: Place your audio file (.mp3, .wav, .ogg) inside{" "}
                      <code className="bg-white px-1 py-0.5 rounded border border-[#E8E3DA]">
                        frontend/public/music/
                      </code>{" "}
                      and specify{" "}
                      <code className="bg-white px-1 py-0.5 rounded border border-[#E8E3DA]">
                        /music/wedding-theme.wav
                      </code>
                    </li>
                    <li>
                      <strong>External direct URL</strong>: Direct link starting with{" "}
                      <code className="bg-white px-1 py-0.5 rounded border border-[#E8E3DA]">
                        https://
                      </code>{" "}
                      ending in .mp3, .wav, or .ogg
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Presets Selection */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                <h4 className="text-sm font-serif font-semibold text-[#26231F]">
                  Quick Sample Tracks & Presets
                </h4>
              </div>
              <p className="text-xs text-[#746E66]">
                Click any sample track below to populate and test the audio player immediately:
              </p>

              <div className="space-y-2.5">
                {PRESET_TRACKS.map((preset, idx) => {
                  const isSelected =
                    formData.backgroundMusicUrl === preset.url &&
                    formData.musicTitle === preset.title;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-[#C9A96E]/5 border-[#C9A96E] ring-1 ring-[#C9A96E]"
                          : "bg-white border-[#E8E3DA] hover:bg-[#F8F6F1] hover:border-[#D8B4A0]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#C9A96E] text-white"
                              : "bg-[#F8F6F1] text-[#746E66]"
                          }`}
                        >
                          <Disc3
                            className={`w-4 h-4 ${
                              isSelected && isPlaying ? "animate-spin" : ""
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#26231F] truncate">
                            {preset.title}
                          </p>
                          <p className="text-[11px] text-[#746E66] truncate">
                            {preset.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8C703E]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-xs text-[#8C703E] hover:underline font-medium">
                            Use this
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Audio Preview & Player (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live HTML5 Preview Player */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DA]/80">
                <div className="flex items-center gap-2">
                  <Disc3
                    className={`w-4 h-4 text-[#C9A96E] ${
                      isPlaying ? "animate-spin" : ""
                    }`}
                  />
                  <h4 className="text-sm font-serif font-semibold text-[#26231F]">
                    Live Audio Preview
                  </h4>
                </div>
                <span className="text-[11px] text-[#746E66]">Admin Preview</span>
              </div>

              {/* Vinyl / Cover Art Visual Card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#26231F] to-[#3B3731] text-white p-6 flex flex-col items-center text-center overflow-hidden shadow-inner">
                {/* Decorative background glow */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#C9A96E]/20 rounded-full blur-2xl pointer-events-none" />

                {/* Spinning Disc Monogram */}
                <div
                  className={`w-24 h-24 rounded-full border-4 border-[#C9A96E]/40 bg-radial from-[#4A443D] to-[#1E1B18] shadow-xl flex items-center justify-center relative mb-4 transition-transform ${
                    isPlaying ? "animate-[spin_10s_linear_infinite]" : ""
                  }`}
                >
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 rounded-full border border-white/10" />
                  <div className="absolute inset-4 rounded-full border border-white/10" />
                  <div className="w-8 h-8 rounded-full bg-[#C9A96E] flex items-center justify-center text-white shadow-xs">
                    <Music className="w-4 h-4" />
                  </div>
                </div>

                {/* Track Info */}
                <h5 className="font-serif font-semibold text-sm max-w-xs truncate px-2 text-white">
                  {formData.musicTitle || "No Track Selected"}
                </h5>
                <p className="text-[11px] text-white/60 truncate max-w-xs mt-0.5">
                  {formData.backgroundMusicUrl || "Enter an audio source to preview"}
                </p>

                {/* Soundwave Bars Indicator */}
                <div className="flex items-end gap-1 h-6 mt-4 mb-2">
                  {[40, 70, 95, 60, 85, 50, 100, 65, 80, 45, 90, 55].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying
                          ? "bg-[#C9A96E] animate-pulse"
                          : "bg-white/20"
                      }`}
                      style={{
                        height: isPlaying ? `${h}%` : "20%",
                        animationDelay: `${(i % 4) * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Audio Controls */}
              {audioError ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Playback Error</p>
                    <p className="text-[11px] mt-0.5 text-rose-600/90">{audioError}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Scrubber Progress Bar */}
                  <div className="space-y-1.5">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      disabled={!formData.backgroundMusicUrl || duration === 0}
                      className="w-full h-1.5 bg-[#E8E3DA] rounded-lg appearance-none cursor-pointer accent-[#C9A96E] disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between text-[11px] text-[#746E66]">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Playback Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleRestart}
                      disabled={!formData.backgroundMusicUrl}
                      aria-label="Restart audio track"
                      className="p-2 rounded-xl text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={togglePlay}
                      disabled={!formData.backgroundMusicUrl || audioLoading}
                      aria-label={isPlaying ? "Pause preview" : "Play preview"}
                      className="w-12 h-12 rounded-full bg-[#C9A96E] hover:bg-[#B39358] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {audioLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Mute toggle */}
                    <button
                      type="button"
                      onClick={toggleMute}
                      disabled={!formData.backgroundMusicUrl}
                      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                      className="p-2 rounded-xl text-[#746E66] hover:text-[#26231F] hover:bg-[#F8F6F1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-3 pt-2 px-1">
                    <span className="text-[11px] text-[#746E66] shrink-0">Volume</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      disabled={!formData.backgroundMusicUrl}
                      className="w-full h-1 bg-[#E8E3DA] rounded-lg appearance-none cursor-pointer accent-[#C9A96E] disabled:cursor-not-allowed"
                    />
                    <span className="text-[11px] text-[#746E66] w-8 text-right font-mono">
                      {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Browser Autoplay Notice Card */}
            <div className="bg-[#F8F6F1] rounded-2xl border border-[#E8E3DA] p-5 text-xs text-[#746E66] space-y-2">
              <h5 className="font-semibold text-[#26231F] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Browser Autoplay Behavior</span>
              </h5>
              <p className="leading-relaxed">
                Modern web browsers do not allow unmuted audio to play automatically without a user gesture.
              </p>
              <p className="leading-relaxed">
                When enabled, your guests will see an elegant floating music widget on the bottom-right of the screen that they can click at any time to start or pause the song.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Track Removal */}
      <ConfirmationModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Background Music?"
        message="This will clear the current song title and audio URL, and turn off background music playback on your invitation pages. You can re-enable it at any time."
        confirmText="Remove Track"
        cancelText="Cancel"
        isLoading={saving}
        danger={true}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
}
