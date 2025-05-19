export interface Track {
    id: string;
    name: string;
    artists: string[];
    album: string;
    isrc: string;
    addedAt?: string;
    countryCode: string;
    releaseDate?: string;
    duration?: number;
}
