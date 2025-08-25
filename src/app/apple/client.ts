"use client";

import { Playlist } from "@/app/types/api/responses/playlist";
import { Track } from "@/app/types/api/responses/track";
import { Song } from "../types/song-mapping";

const APPLE_MUSIC_API_URL = 'https://api.music.apple.com/v1';

// TODO: We should refactor this into a class
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

// Gets potential song mappings in Apple Music by ISRC
// ISRC codes can return multiple songs, e.g. if a song appears on multiple albums such as compilations
async function getSongMappingsByISRC(isrcs: string[]): Promise<Record<string, Song[]>> {
    const batchSize = 20;
    const { developerToken, userToken } = getTokens();
    const songMappings: Record<string, Song[]> = {};
    isrcs.forEach(isrc => songMappings[isrc] = [])

    for(let i = 0; i < isrcs.length + batchSize; i += batchSize) {
        const batch = isrcs.slice(i, i + batchSize);
        if (batch.length === 0) break;

        // TODO: Storefront should be configurable
        const url = new URL(`${APPLE_MUSIC_API_URL}/catalog/CA/songs`, window.location.origin);
        url.searchParams.set('filter[isrc]', batch.join(','));
    
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${developerToken}`,
                'Music-User-Token': `${userToken}`,
                'Content-Type': 'application/json'
            }
        });
        const mappingResponse = await response.json();

        // TODO: Extract to mapping class
        mappingResponse.data.forEach((song: any) => {
            if (!song.attributes.isrc) { console.error(`No ISRC found for song: ${song}`); }
            if (!songMappings[song.attributes.isrc]) { songMappings[song.attributes.isrc] = []; }
            songMappings[song.attributes.isrc].push({
                id: song.id,
                isrc: song.attributes.isrc,
                name: song.attributes.name,
                albumName: song.attributes.albumName,
                artistName: song.attributes.artistName,
                releaseDate: song.attributes.releaseDate,
                trackNumber: song.attributes.trackNumber,
                durationInMillis: song.attributes.durationInMillis
            });
        });
    }
    return songMappings;
}

async function getSongMappingsByArtistsNameAndAlbum(artists: string[], songName: string, songAlbum: string): Promise<Song[]> {
    const artistSearch = artists.join('+');

    return getSongsBySearchTerm(`${artistSearch} ${songName} ${songAlbum}`);
}

async function getSongMappingsByArtistsAndName(artists: string[], songName: string): Promise<Song[]> {
    const artistSearch = artists.join('+');

    return await getSongsBySearchTerm(`${artistSearch} ${songName}`);
}

async function getSongsBySearchTerm(searchTerm: string): Promise<Song[]> {
    const { developerToken, userToken } = getTokens();
    const url = new URL(`${APPLE_MUSIC_API_URL}/catalog/CA/search`, window.location.origin);
    url.searchParams.set('types', 'songs');
    url.searchParams.set('term', searchTerm);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${developerToken}`,
            'Music-User-Token': `${userToken}`,
            'Content-Type': 'application/json'
        }
    });
    const searchResponse = await response.json();
    console.log(searchResponse);

    const mappings: Song[] = [];
    searchResponse?.results?.songs?.data?.forEach((song: any) => {
        mappings.push({
            id: song.id,
            isrc: song.attributes.isrc,
            name: song.attributes.name,
            albumName: song.attributes.albumName,
            artistName: song.attributes.artistName,
            releaseDate: song.attributes.releaseDate,
            trackNumber: song.attributes.trackNumber,
            durationInMillis: song.attributes.durationInMillis
        });
    });

    return mappings;
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
        throw new Error('MusicKit SDK not loaded. Please refresh the page.');
    }

    const musicKit = window.MusicKit.getInstance();
    const developerToken = musicKit.developerToken;

    if (!developerToken) {
        throw new Error('Developer token not found. MusicKit may not be properly configured.');
    }

    return developerToken;
}

function getUserToken(): string {
    if (!window || !window.MusicKit) {
        throw new Error('MusicKit SDK not loaded. Please refresh the page.');
    }

    const musicKit = window.MusicKit.getInstance();
    const userToken = musicKit.musicUserToken;

    if (!userToken) {
        throw new Error('User token not found. Please authenticate with Apple Music.');
    }

    return userToken;
}

export { createPlaylist, getSongsByISRC, getSongMappingsByISRC, getSongMappingsByArtistsNameAndAlbum, getSongMappingsByArtistsAndName, addSongsToPlaylist };
