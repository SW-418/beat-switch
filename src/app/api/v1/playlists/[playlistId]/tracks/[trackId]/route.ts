import {NextRequest, NextResponse} from "next/server";
import {PlaylistMappingUpdate} from "@/app/types/api/requests/playlist-mapping-update";
import SongMappingService from "@/services/song-mapping";

const songMappingService = new SongMappingService();

async function PATCH(request: NextRequest, { params }: { params: Promise<{ playlistId: string, trackId: string }> }): Promise<NextResponse> {
    const { playlistId, trackId } = await params;
    const playlistIdNum = Number(playlistId);
    const trackIdNum = Number(trackId);

    if (Number.isNaN(playlistIdNum) || Number.isNaN(trackIdNum)) {
        return NextResponse.json({ message: 'Invalid path parameters' }, { status: 400 });
    }

    // TODO: Validate user owns playlist/song mapping

    const userId = Number(request.cookies.get('userId')?.value);
    if (!userId) return NextResponse.json({ message: 'No user id found' }, { status: 401 });

    try {
        // TODO: Handle deserialization and validation better
        const update = await request.json() as PlaylistMappingUpdate;
        await songMappingService.updateSongMapping(playlistIdNum, trackIdNum, update);
        return NextResponse.json({}, { status: 204 });
    } catch (Error) {
        console.error(Error);
        return NextResponse.json({}, { status: 500 });
    }
}

export { PATCH };
