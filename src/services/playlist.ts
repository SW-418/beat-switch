import {PlaylistNotFoundError, PlaylistUnauthorizedError} from "@/app/types/errors/playlist-errors";
import PlaylistDb from "@/data-access/db/playlist";
import {Account, Playlist, PlaylistSyncState} from "@/generated/prisma";
import SongMappingService from "./song-mapping";
import {SongMappingWithSong} from "@/app/types/song-mapping";

class PlaylistService {
    private playlistDb: PlaylistDb;
    private songMappingService: SongMappingService;
    constructor() {
        this.playlistDb = new PlaylistDb();
        this.songMappingService = new SongMappingService();
    }

    async createPlaylist(accountId: number, name: string): Promise<number> {
        return await this.playlistDb.createPlaylist(accountId, name);
    }

    async getSavedPlaylist(accountId: number): Promise<number | undefined> {
        return await this.playlistDb.getSavedPlaylist(accountId);
    }

    async getUserPlaylists(userId: number): Promise<Playlist[]> {
        return await this.playlistDb.getUserPlaylists(userId);
    }

    async updatePlaylistToSynced(playlistId: number): Promise<void> {
        await this.updatePlaylistStatus(playlistId, PlaylistSyncState.SYNCED);
    }

    async updatePlaylistToSyncFailed(playlistId: number): Promise<void> {
        await this.updatePlaylistStatus(playlistId, PlaylistSyncState.SYNC_FAILED);
    }

    async updatePlaylistToMapping(playlistId: number): Promise<void> {
        await this.updatePlaylistStatus(playlistId, PlaylistSyncState.MAPPING);
    }

    async updatePlaylistToMapped(playlistId: number): Promise<void> {
        await this.updatePlaylistStatus(playlistId, PlaylistSyncState.MAPPED);
    }

    async getPlaylistTracks(playlistId: number, userId: number, unmappedOnly: boolean): Promise<SongMappingWithSong[]> {
        const playlist: Playlist & { Account: Account } | null = await this.playlistDb.getPlaylistById(playlistId);
        if (!playlist) throw new PlaylistNotFoundError(playlistId);
        if (playlist.Account?.userId !== userId) throw new PlaylistUnauthorizedError(userId, playlistId);

        return await this.songMappingService.getSongMappings(playlistId, unmappedOnly);
    }

    private async updatePlaylistStatus(playlistId: number, status: PlaylistSyncState): Promise<void> {
        await this.playlistDb.updatePlaylistStatus(playlistId, status);
    }
}

export default PlaylistService;
