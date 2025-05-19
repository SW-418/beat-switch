"use client";

import { useEffect, useState } from "react";
import NavigationBar from "../components/navigation-bar";
import { getAccessToken, getCodeQueryParameter, getCodeVerifier, getUserProfile, handleLogin, removeCodeQueryParameter } from "../spotify/auth";
import SpotifyPlaylists from "../components/spotify-playlists";
import LoginClient from "../login/client";

export default function Transfer() {
    // TODO: Pull these out into spotify related hooks/contexts
    const [code, setCode] = useState('');
    const [profile, setProfile] = useState({
      displayName: '',
      id: ''
    });

    const [loading, setLoading] = useState(true);

    // TODO: Pull these out into apple related hooks/contexts
    const [musicKit, setMusicKit] = useState<typeof window.MusicKit | null>(null);
    const [isAuthenticatedWithApple, setIsAuthenticatedWithApple] = useState(false);
    
    // TODO: Pull these out into spotify related hooks/contexts
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
        setIsAuthenticatedWithApple(musicKit.getInstance().isAuthorized);
      }, [musicKit]);
    
    async function handleAppleLogin() {
        if (!musicKit || !musicKit.getInstance()) return;
        await musicKit.getInstance().authorize();
        setIsAuthenticatedWithApple(true);
    }

    return (
        <div className="min-h-screen flex flex-row items-center justify-center font-[family-name:var(--font-geist-sans)] w-[90%] mx-auto text-center">
            <div className="top-0 absolute pt-4 w-[90%] mx-auto">
                <NavigationBar />
            </div>
            <div className="w-[50%] mx-auto">
                {(!loading && !profile.displayName) && (
                        <><h1 className="text-4xl font-bold mb-8">Transfer</h1><button
                        onClick={handleLogin}
                        className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                        >
                        Connect with Spotify
                        </button></>
                )}
                {(!loading && profile.displayName) && (
                    <SpotifyPlaylists />
                )}
            </div>

            <div className="w-[50%] mx-auto">
                {(!loading && !isAuthenticatedWithApple) && (
                    <><h1 className="text-4xl font-bold mb-8">Transfer</h1><button
                    onClick={handleAppleLogin}
                    className="bg-[#FA2D48] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#FA2D75] transition-colors"
                    >
                    Connect with Apple Music
                    </button></>
                )}
            </div>
        </div>
    );  
}
