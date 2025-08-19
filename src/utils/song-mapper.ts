import { Song } from "@/app/types/song-mapping";
import NoMappingsError from "@/app/types/errors/no-mappings";

class SongMapper implements IMusicMapper<Song, Song> {
    constructor() { }

    map(original: Song, options: Song[]): Song {
        if (options.length === 0) throw new NoMappingsError();

        // TODO: Improve mapping logic
        const matches = options.filter(song => 
            song.name === original.name && 
            song.albumName === original.albumName
        );
        
        if (matches.length === 0) throw new NoMappingsError();
        
        return matches[0];
    }
}

interface IMusicMapper<T, U> {
    map(original: T, options: U[]): U;
}

export default new SongMapper();
