"use client";

import { useEffect, useState } from "react";
import { getCodeQueryParameter, handleLogin, getCodeVerifier, getAccessToken, getUserProfile, removeCodeQueryParameter } from "./auth";
import NavigationBar from "../components/navigation-bar";
import PlaylistGenerator from "../components/spotify-playlist-generator";
import LoginClient from "../login/client"; 

export default function Spotify() {
  const [code, setCode] = useState('');
  const [profile, setProfile] = useState({
    displayName: '',
    id: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlCode = getCodeQueryParameter();
    
    if (urlCode && code === '') {
      setCode(urlCode);
      removeCodeQueryParameter();
    }
  }, [code]);

  useEffect(() => {
    // TODO: Single responsibility refactor
    const tryAuthenticateAndSetProfile = async () => {
      try {
        const profile = await getUserProfile();
        setProfile(profile);
        await LoginClient.loginWithSpotify(profile.id);
        return true;
      } catch(error) {
        return false;
      }
    }

    const response = async () => {
      // Check if already authenticated and return if so
      if (await tryAuthenticateAndSetProfile()) {
        setLoading(false);
        return;
      }

      // If code isn't set this hasn't been triggered as part of dependencies so return
      if (!code) {
        setLoading(false);
        return;
      }
      
      // Otherwise get required codes and try to perform authentication
      const codeVerifier = getCodeVerifier();
      
      if (!codeVerifier) return;

      await getAccessToken(code, codeVerifier);
      await tryAuthenticateAndSetProfile();
      setLoading(false);
    }
    
    response();
  }, [code]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] w-[90%] mx-auto text-center">
      <div className="top-0 absolute pt-4 w-[90%] mx-auto">
        <NavigationBar />
        {loading && <p>Loading...</p>}
        {profile.displayName && <p>Welcome {profile.displayName} 👋</p>}
      </div>
      {(!loading && !profile.displayName) && (
            <><h1 className="text-4xl font-bold mb-8">Spotify</h1><button
              onClick={handleLogin}
              className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
            >
              Connect with Spotify
            </button></>
          )}
          {profile.displayName && <PlaylistGenerator profile={profile} />}
    </div>
  );
}
