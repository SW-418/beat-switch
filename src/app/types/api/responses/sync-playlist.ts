
export interface SyncPlaylist {
    id: number;
    name: string;
    status: string;
    mappingCounts: {
        readyToMap: number;
        mapped: number;
        manualMappingRequired: number;
        skipped: number;
    };
}
