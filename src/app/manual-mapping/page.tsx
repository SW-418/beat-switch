"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SongMappingWithSong } from "@/app/types/song-mapping";
import { Song } from "@/app/types/song-mapping";
import { getSongMappingsByNames } from "@/app/apple/client";
import PlaylistClient from "@/app/playlist/client";

const playlistClient = new PlaylistClient();

export default function ManualMapping() {
    const searchParams = useSearchParams();
    const playlistId = searchParams.get('playlistId');
    
    const [songsNeedingMapping, setSongsNeedingMapping] = useState<SongMappingWithSong[]>([]);
    const [currentSong, setCurrentSong] = useState<SongMappingWithSong | null>(null);
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!playlistId) return;
        fetchSongsNeedingMapping();
    }, [playlistId]);

    const fetchSongsNeedingMapping = async () => {
        if (!playlistId) return;
        
        try {
            const response = await fetch(`/api/v1/playlists/${playlistId}/songs?states=MANUAL_MAPPING_REQUIRED`);
            const songs = await response.json();
            setSongsNeedingMapping(songs);
            if (songs.length > 0) {
                setCurrentSong(songs[0]);
            }
        } catch (error) {
            console.error('Failed to fetch songs needing mapping:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchForSong = async (song: SongMappingWithSong) => {
        setSearching(true);
        try {
            console.log(song)
            const results = await getSongMappingsByNames(song.song.artists.map(a => a.name), song.song.name, song.song.album);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const mapSong = async (songMapping: SongMappingWithSong, selectedSong: Song) => {
        if (!playlistId) return;
        
        try {
            await playlistClient.mapPlaylistSong(parseInt(playlistId), songMapping.id, selectedSong.id.toString());
            
            // Remove from current list and move to next song
            const updatedSongs = songsNeedingMapping.filter(s => s.id !== songMapping.id);
            setSongsNeedingMapping(updatedSongs);
            setCurrentSong(updatedSongs.length > 0 ? updatedSongs[0] : null);
            setSearchResults([]);
        } catch (error) {
            console.error('Failed to map song:', error);
        }
    };

    const skipSong = async (songMapping: SongMappingWithSong) => {
        if (!playlistId) return;
        
        try {
            await playlistClient.updatePlaylistSongMappingState(parseInt(playlistId), songMapping.id, 'SKIPPED');
            
            // Remove from current list and move to next song
            const updatedSongs = songsNeedingMapping.filter(s => s.id !== songMapping.id);
            setSongsNeedingMapping(updatedSongs);
            setCurrentSong(updatedSongs.length > 0 ? updatedSongs[0] : null);
            setSearchResults([]);
        } catch (error) {
            console.error('Failed to skip song:', error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    
    if (!playlistId) {
        return <div className="p-8">Please provide a playlist ID</div>;
    }

    if (songsNeedingMapping.length === 0) {
        return <div className="p-8">No songs require manual mapping!</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Manual Song Mapping</h1>
                
                <div className="mb-4">
                    <p className="text-lg text-gray-700">
                        {songsNeedingMapping.length} songs remaining
                    </p>
                </div>

                {currentSong && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Current Song</h2>
                        <div className="mb-4 text-gray-700">
                            <p><strong>Name:</strong> {currentSong.song.name}</p>
                            <p><strong>Album:</strong> {currentSong.song.album}</p>
                            <p><strong>Artists:</strong> {currentSong.song.artists.map(a => a.name).join(', ')}</p>
                            <p><strong>ISRC:</strong> {currentSong.song.isrc}</p>
                        </div>
                        
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => searchForSong(currentSong)}
                                disabled={searching}
                                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {searching ? 'Searching...' : 'Search Apple Music'}
                            </button>
                            <button
                                onClick={() => skipSong(currentSong)}
                                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                            >
                                Skip Song
                            </button>
                        </div>

                        {searchResults.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Search Results</h3>
                                <div className="space-y-4">
                                    {searchResults.map((result) => (
                                        <div key={result.id} className="border rounded p-4 flex justify-between items-center bg-gray-50">
                                            <div className="text-gray-700">
                                                <p><strong className="text-gray-900">{result.name}</strong></p>
                                                <p>{result.artistName} • {result.albumName}</p>
                                                <p className="text-sm text-gray-600">ISRC: {result.isrc}</p>
                                            </div>
                                            <button
                                                onClick={() => mapSong(currentSong, result)}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            >
                                                Map This Song
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}