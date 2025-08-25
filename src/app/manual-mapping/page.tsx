"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SongMappingWithSong } from "@/app/types/song-mapping";
import { Song } from "@/app/types/song-mapping";
import {
    getSongMappingsByNameAndArtists, getSongMappingsByName, getSongsBySearchTerm
} from "@/app/apple/client";
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
    const [manualSearchTerm, setManualSearchTerm] = useState("");
    const [albumMappings, setAlbumMappings] = useState<Record<string, string>>({});

    // TODO: Pull these out into apple related hooks/contexts
    const [musicKit, setMusicKit] = useState<typeof window.MusicKit | null>(null);
    const [isAuthenticatedWithApple, setIsAuthenticatedWithApple] = useState(false);

    useEffect(() => {
        if (!playlistId) return;
        (async () => {
            await fetchSongsNeedingMapping();
        })()
    }, [playlistId]);

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
    }, [musicKit]);

    useEffect(() =>{
        if (currentSong === null) return;
        setTimeout(() => searchForSong(currentSong), 100);
    }, [currentSong])

    async function handleAppleLogin() {
        if (!musicKit || !musicKit.getInstance()) return;
        await musicKit.getInstance().authorize();
        setIsAuthenticatedWithApple(true);
    }

    const fetchSongsNeedingMapping = async () => {
        if (!playlistId) return;
        
        try {
            const response = await fetch(`/api/v1/playlists/${playlistId}/songs?states=MANUAL_MAPPING_REQUIRED`);
            const songs = await response.json();
            setSongsNeedingMapping(songs);
            if (songs.length > 0) {
                setCurrentSong(songs[0]);
                // Automatically search for the first song
                setTimeout(() => searchForSong(songs[0]), 100);
            }
        } catch (error) {
            console.error('Failed to fetch songs needing mapping:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to clean song names for comparison
    const cleanSongName = (name: string) => {
        return name
            .toLowerCase()
            .replace(/\[.*?\]/g, '') // Remove [...]
            .replace(/\(.*?\)/g, '') // Remove (...)
            .replace(/\s*-\s*feat\.?\s+.*$/i, '') // Remove - feat. and everything after
            .replace(/\bfeat\.?\s+.*$/i, '') // Remove feat. and everything after
            .replace(/\bft\.?\s+.*$/i, '') // Remove ft. and everything after
            .trim();
    };

    const searchForSong = async (song: SongMappingWithSong) => {
        setSearching(true);
        try {
            const results: Song[] = []

            const [
                // mappingsByArtistNameAndAlbum,
                mappingsByArtistAndName,
                mappingsByName
            ] = await Promise.all([
                // getSongMappingsByArtistsNameAndAlbum(song.song.artists.map(a => a.name), song.song.name, song.song.album),
                getSongMappingsByNameAndArtists(song.song.name, [song.song.artists[0].name]),
                getSongMappingsByName(cleanSongName(song.song.name))
            ]);

            // results.push(...mappingsByArtistNameAndAlbum);
            results.push(...mappingsByArtistAndName);
            results.push(...mappingsByName);

            // Remove duplicates based on ISRC using Set for O(1) lookup
            const seenISRCs = new Set<string>();
            const uniqueResults = results.filter(result => {
                if (seenISRCs.has(result.isrc)) return false;
                seenISRCs.add(result.isrc);
                return true;
            });
            
            // Check for automatic mapping
            const originalAlbum = song.song.album;
            const mappedAlbumName = albumMappings[originalAlbum];

            // Helper function to clean album names for comparison
            const cleanAlbumName = (name: string) => {
                return name
                    .toLowerCase()
                    .replace(/\s*-\s*EP$/i, '') // Remove - EP at the end
                    .trim();
            };
            
            const autoMatch = uniqueResults.find(result => {
                const isrcMatch = result.isrc && song.song.isrc && result.isrc === song.song.isrc;
                const songNamesMatch = cleanSongName(result.name) === cleanSongName(song.song.name);
                const albumsMatch = cleanAlbumName(result.albumName) === cleanAlbumName(originalAlbum);
                const hasMappedAlbum = mappedAlbumName && cleanAlbumName(result.albumName) === cleanAlbumName(mappedAlbumName);
                
                return isrcMatch || (songNamesMatch && (albumsMatch || hasMappedAlbum));
            });
            
            if (autoMatch) {
                await mapSong(song, autoMatch)

                return;
            }
            
            setSearchResults(uniqueResults);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const manualSearch = async () => {
        if (!manualSearchTerm.trim()) return;
        
        setSearching(true);
        try {
            const results = await getSongsBySearchTerm(manualSearchTerm);
            setSearchResults(results);
        } catch (error) {
            console.error('Manual search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    const mapSong = async (songMapping: SongMappingWithSong, selectedSong: Song) => {
        if (!playlistId) return;
        
        try {
            await playlistClient.mapPlaylistSong(parseInt(playlistId), songMapping.id, selectedSong.id.toString());
            
            // Store album mapping
            const originalAlbum = songMapping.song.album;
            const mappedAlbum = selectedSong.albumName;
            if (originalAlbum !== mappedAlbum) {
                setAlbumMappings(prev => ({
                    ...prev,
                    [originalAlbum]: mappedAlbum
                }));
            }

            await updateSongState(songMapping)

        } catch (error) {
            console.error('Failed to map song:', error);
        }
    };

    const skipSong = async (songMapping: SongMappingWithSong) => {
        if (!playlistId) return;
        
        try {
            await playlistClient.updatePlaylistSongMappingState(parseInt(playlistId), songMapping.id, 'SKIPPED');
            await updateSongState(songMapping)
        } catch (error) {
            console.error('Failed to skip song:', error);
        }
    };

    const updateSongState = async (song: SongMappingWithSong) => {
        const updatedSongs = songsNeedingMapping.filter(s => s.id !== song.id);
        setSongsNeedingMapping(updatedSongs);
        const nextSong = updatedSongs.length > 0 ? updatedSongs[0] : null;
        setCurrentSong(nextSong);
        setSearchResults([]);
        setManualSearchTerm("");
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!isAuthenticatedWithApple) return <div className="p-8">
        <button
            onClick={handleAppleLogin}
            className="bg-[#FA2D48] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#FA2D75] transition-colors"
        >
            Connect with Apple Music
        </button>
    </div>;

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

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2 text-gray-900">Manual Search</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualSearchTerm}
                                    onChange={(e) => setManualSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && manualSearch()}
                                    placeholder="Enter search terms..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                />
                                <button
                                    onClick={manualSearch}
                                    disabled={searching || !manualSearchTerm.trim()}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {searchResults.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Search Results</h3>
                                <div className="space-y-4">
                                    {searchResults.map((result) => (
                                        <div key={result.id} className="border rounded p-4 flex items-center gap-4 bg-gray-50">
                                            {result.artworkUrl && (
                                                <img 
                                                    src={result.artworkUrl} 
                                                    alt={`${result.albumName} artwork`}
                                                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 text-gray-700">
                                                <p><strong className="text-gray-900">{result.name}</strong></p>
                                                <p>{result.artistName} • {result.albumName}</p>
                                                <p className="text-sm text-gray-600">ISRC: {result.isrc}</p>
                                            </div>
                                            <button
                                                onClick={() => mapSong(currentSong, result)}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex-shrink-0"
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