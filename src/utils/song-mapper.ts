import {Song, SongMappingWithSong} from "@/app/types/song-mapping";
import NoMappingsError from "@/app/types/errors/no-mappings";

class SongMapper implements IMusicMapper<Song, Song> {
    constructor() { }

    map(original: SongMappingWithSong, options: Song[]): Song {
        if (options === undefined || options === null || options.length === 0) throw new NoMappingsError();

        // TODO: Improve mapping logic
        const matches = options.filter(song => 
            song.name === original.song.name &&
            song.albumName === original.song.album
        );
        
        if (matches.length === 0) throw new NoMappingsError();
        
        return matches[0];
    }
}

interface IMusicMapper<T, U> {
    map(original: T, options: U[]): U;
}

const songMapper = new SongMapper();
export default songMapper;
