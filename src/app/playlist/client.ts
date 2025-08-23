import {SyncPlaylist} from "@/app/types/api/responses/sync-playlist";
import {PlaylistMappingUpdate} from "@/app/types/api/requests/playlist-mapping-update";
import {$Enums} from "@/generated/prisma";
import SongMappingState = $Enums.SongMappingState;

class PlaylistClient {

    async getSyncPlaylists(): Promise<SyncPlaylist[]> {
        const url = '/api/v1/playlists';
        const response = await fetch(url);
        return await response.json();
    }

    async mapPlaylistSong(playlistId: number, songMappingId: number, songMapping: string): Promise<void> {
        const url = `/api/v1/playlists/${playlistId}/songs/${songMappingId}`;
        const requestBody: PlaylistMappingUpdate = {
            mappedSongId: songMapping,
            songMappingState: SongMappingState.MAPPED,
        }

        await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
    }

    async updatePlaylistSongMappingState(playlistId: number, songMappingId: number, state: SongMappingState): Promise<void> {
        const url = `/api/v1/playlists/${playlistId}/songs/${songMappingId}`;
        const requestBody: PlaylistMappingUpdate = {
            songMappingState: state
        }

        await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
    }
}

export default PlaylistClient;
