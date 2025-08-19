export interface Track {
    id: string;
    name: string;
    artists: string[];
    album: string;
    isrc: string;
    added_at?: string;
    country_code: string;
    external_id?: string;
}
