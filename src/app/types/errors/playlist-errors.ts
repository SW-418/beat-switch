class PlaylistNotFoundError extends Error {
    constructor(playlistId: number) {
      super(`Playlist with ID ${playlistId} not found`);
      this.name = 'PlaylistNotFoundError';
    }
}
  
class PlaylistUnauthorizedError extends Error {
    constructor(userId: number, playlistId: number) {
      super(`User ${userId} is not authorized to access playlist ${playlistId}`);
      this.name = 'PlaylistUnauthorizedError';
    }
}

export { PlaylistNotFoundError, PlaylistUnauthorizedError };
