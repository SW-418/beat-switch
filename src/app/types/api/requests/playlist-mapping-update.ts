import {$Enums} from "@/generated/prisma";
import SongMappingState = $Enums.SongMappingState;

export interface PlaylistMappingUpdate {
    songMappingState: SongMappingState;
    mappedSongId?: string;
}
