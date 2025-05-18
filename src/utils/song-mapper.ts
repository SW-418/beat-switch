import { Track } from "@/app/types/responses/track";
import { SongMapping } from "@/app/types/song-mapping";
import NoMappingsError from "@/app/types/errors/no-mappings";

class SongMapper implements IMusicMapper<Track, SongMapping> {
    constructor() { }

    map(original: Track, options: SongMapping[]): SongMapping {
        if (options.length === 0) throw new NoMappingsError();

        const matches = options.filter(song => 
            song.name === original.name && 
            song.albumName === original.album
        );
        
        if (matches.length === 0) throw new NoMappingsError();
        
        return matches[0];
    }
}

interface IMusicMapper<T, U> {
    map(original: T, options: U[]): U;
}

export default new SongMapper();
