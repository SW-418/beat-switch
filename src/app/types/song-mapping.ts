import { SongMappingState } from "@/generated/prisma";

export interface Song {
    id: number;
    isrc: string;
    name: string;
    albumName: string;
    artistName: string;
    releaseDate: string;
    trackNumber: number;
    durationInMillis: number;
    artworkUrl?: string;
}

export interface SongMapping extends Song {
    state: SongMappingState;
}

// TODO: This needs cleaning up badly it's hella confusing
export type SongMappingWithSong = SongMapping & {
    song: {
      id: number;
      name: string;
      artists: Array<{ name: string }>;
      album: string;
      isrc: string;
      addedAt: Date;
      countryCode: string;
      releaseDate: Date;
      duration: number;
    }
};
