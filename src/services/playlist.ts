import PlaylistDb from "@/data-access/db/playlist";

class PlaylistService {
    private playlistDb: PlaylistDb;
    constructor() {
        this.playlistDb = new PlaylistDb();
    }

    async createPlaylist(accountId: number, name: string): Promise<number> {
        return await this.playlistDb.createPlaylist(accountId, name);
    }

    async getSavedPlaylist(accountId: number): Promise<number | undefined> {
        return await this.playlistDb.getSavedPlaylist(accountId);
    }
}

export default PlaylistService;
