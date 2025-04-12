"use client";

import { useEffect, useState } from "react";
import NavigationBar from "../components/navigation-bar";

export default function Apple() {
  const [musicKit, setMusicKit] = useState<typeof window.MusicKit | null>(null);

  useEffect(() => {
    if (!process.env.APPLE_MUSIC_DEV_TOKEN || typeof window === 'undefined') return;

    if (!window.MusicKit) {
      console.warn('MusicKit SDK not loaded');
      return;
    }

    window.MusicKit.configure({
      developerToken: process.env.APPLE_MUSIC_DEV_TOKEN,
      app: { name: 'Beat Switch', build: '1.0.0' },
    });

    console.log('MusicKit configured');

    setMusicKit(window.MusicKit);
  }, []);

  async function handleLogin() {
    if (!musicKit) return;
    await musicKit.getInstance().authorize();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] w-[90%] mx-auto text-center">
      <div className="top-0 absolute pt-4 w-[90%] mx-auto">
        <NavigationBar />
      </div>
      <h1 className="text-4xl font-bold mb-8"> Apple Music </h1>
      <button
        onClick={handleLogin}
        className="bg-[#FA2D48] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#FA2D75] transition-colors"
      >
        Connect with Apple Music
      </button>
    </div>
  );
}
