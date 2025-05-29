import { SongMappingState } from "@/generated/prisma";

export interface Song {
    id: string;
    isrc: string;
    name: string;
    albumName: string;
    artistName: string;
    releaseDate: string;
    trackNumber: number;
    durationInMillis: number;
}

export interface SongMapping extends Song {
    state: SongMappingState;
}

export type SongMappingWithSong = SongMapping & {
    Song: {
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
