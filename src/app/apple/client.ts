"use client";

import { Playlist } from "../types/responses/playlist";
import { Track } from "../types/responses/track";

const APPLE_MUSIC_API_URL = 'https://api.music.apple.com/v1';

async function createPlaylist(playlist: Playlist): Promise<string> {
    const { developerToken, userToken } = getTokens();
    
    const response = await fetch(`${APPLE_MUSIC_API_URL}/me/library/playlists`, { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${developerToken}`,
            'Music-User-Token': `${userToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            attributes: {
                name: playlist.name,
                description: playlist.description
            }
        })
    });

    const responseBody = await response.json();
    const playlistId = responseBody.data[0].id;

    return playlistId;
}

// Mapping of ISRC to Apple Music track ID
async function getSongsByISRC(songs: Track[]): Promise<Record<string, string>> {
    const batchSize = 20;
    const { developerToken, userToken } = getTokens();
    const songMappings: Record<string, string> = {};

    for(let i = 0; i < songs.length + batchSize; i += batchSize) {
        const batch = songs.slice(i, i + batchSize);
        if (batch.length === 0) break;

        // TODO: Storefront should be configurable
        const url = new URL(`${APPLE_MUSIC_API_URL}/catalog/CA/songs`, window.location.origin);
        url.searchParams.set('filter[isrc]', batch.map(song => song.isrc).join(','));
    
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${developerToken}`,
                'Music-User-Token': `${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        const mappingResponse = await response.json();
            
        // TODO: DefinitelyTyped for Apple Responses
        mappingResponse.data.forEach((song: any) => {
            if (!song.attributes.isrc) { console.error(`No ISRC found for song: ${song}`); }
            songMappings[song.attributes.isrc] = song.id;
        });
    }

    return songMappings;
}

async function addSongsToPlaylist(songs: Track[], appleMusicPlaylistId: string): Promise<void> { 
    const { developerToken, userToken } = getTokens();
    
    const songIds = songs.map(song => {
        const songId = song.external_id;
        if (!songId) {
            console.error(`No song found for ISRC: ${song.isrc}`);
        }
        return songId;
    });
    
    const response = await fetch(`${APPLE_MUSIC_API_URL}/me/library/playlists/${appleMusicPlaylistId}/tracks`, { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${developerToken}`,
            'Music-User-Token': `${userToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: songIds.map(songId => ({
                id: songId,
                type: 'songs'
            }))
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to add songs to playlist');
    }
}
    
function getTokens(): {developerToken: string, userToken: string} {
    return { developerToken: getDeveloperToken(), userToken: getUserToken() };
}

function getDeveloperToken(): string {
    if (!window || !window.MusicKit) {
        throw new Error('MusicKit SDK not loaded');
    }

    const musicKit = window.MusicKit.getInstance();
    const developerToken = musicKit.developerToken;

    if (!developerToken) {
        throw new Error('Developer token not found');
    }

    return developerToken;
}

function getUserToken(): string {
    if (!window || !window.MusicKit) {
        throw new Error('MusicKit SDK not loaded');
    }

    const musicKit = window.MusicKit.getInstance();
    const userToken = musicKit.musicUserToken;

    if (!userToken) {
        throw new Error('User token not found');
    }

    return userToken;
}

export { createPlaylist, getSongsByISRC, addSongsToPlaylist };