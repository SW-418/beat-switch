"use client";

import { useEffect, useState } from "react";
import NavigationBar from "../components/navigation-bar";
import ApplePlaylistGenerator from "../components/apple-playlist-generator";

export default function Apple() {
  const [musicKit, setMusicKit] = useState<typeof window.MusicKit | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.MusicKit) {
      console.warn('MusicKit SDK not loaded');
      return;
    }

    fetch('/api/v1/apple/token')
      .then(res => res.json())
      .then(token => {
        window.MusicKit.configure({
          developerToken: token.token,
          app: { name: 'Beat Switch', build: '1.0.0' },
        });
      });

    setMusicKit(window.MusicKit);
  }, []);

  useEffect(() => {
    if (!musicKit || !musicKit.getInstance()) return;
    setIsAuthenticated(musicKit.getInstance().isAuthorized);
  }, [musicKit]);

  async function handleLogin() {
    if (!musicKit || !musicKit.getInstance()) return;
    await musicKit.getInstance().authorize();
    setIsAuthenticated(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] w-[90%] mx-auto text-center">
      <div className="top-0 absolute pt-4 w-[90%] mx-auto">
        <NavigationBar />
      </div>

      {!isAuthenticated ? (
        <>
          <h1 className="text-4xl font-bold mb-8"> Apple Music </h1>
          <button
            onClick={handleLogin}
            className="bg-[#FA2D48] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#FA2D75] transition-colors"
          >
            Connect with Apple Music
          </button>
        </> 
      ) : (
        <ApplePlaylistGenerator musicKit={musicKit} />
      )}
    </div>
  );
}
