"use client";

import { useEffect, useState } from "react";
import spotifyClient from "../data-access/spotify/accounts";
import Songs from "./components/songs";

export default function Home() {
  const [code, setCode] = useState('');
  const [tokenRetrieved, setTokenRetrieved] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    id: ''
  });

  const handleLogin = async () => {
    try {
      const { url, verifier } = await spotifyClient.authorize();
      window.location.href = url;
      window.localStorage.setItem('code_verifier', verifier);
    } catch (error) {
      console.error('Failed to get authorization URL:', error); 
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCode = urlParams.get('code');
    
    if (urlCode && code === '') {
      setCode(urlCode);
    }
  }, []); 

  useEffect(() => {
    const codeVerifier = window.localStorage.getItem('code_verifier');
    if (code && codeVerifier) {
      const url = new URL('/api/v1/spotify/token', window.location.origin);
      url.searchParams.set('code', code);
      url.searchParams.set('verifier', codeVerifier);

      const response = async () => {
        const response = await fetch(url.toString(), {
          method: 'GET' ,
          headers: {
            'Content-Type': 'application/json',
          },
        })
        setTokenRetrieved(true);
        window.localStorage.removeItem('code_verifier');
      }
      response();
    }
  }, [code]);

  useEffect(() => {
    const response = async () => {
      const url = new URL('/api/v1/spotify/profile', window.location.origin);
      const response = await fetch(url.toString(), {
        method: 'GET' ,
        headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.status !== 200) {
          setLoggedIn(false);
          return;
        }
        const data = await response.json();
        setProfile(data);
        setLoggedIn(true);
      }
      response();
  }, [tokenRetrieved]);

  useEffect(() => {
    if (profile.displayName) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] w-[90%] mx-auto text-center">
      <div className="top-0 absolute pt-4">
        {loggedIn && <p>Welcome {profile.displayName} 👋</p>}
      </div>
      <main className="flex-1 flex flex-col justify-center w-full">
        {!loggedIn && (
          <><h1 className="text-4xl font-bold mb-8">Beat Switch</h1><button
            onClick={handleLogin}
            className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            Connect with Spotify
          </button></>
        )}
        {loggedIn && <Songs />}
      </main>
    </div>
  );
}
