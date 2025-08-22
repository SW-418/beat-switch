import {NextRequest, NextResponse} from "next/server";
import {PlaylistMappingUpdate} from "@/app/types/api/requests/playlist-mapping-update";
import SongMappingService from "@/services/song-mapping";

const songMappingService = new SongMappingService();

// TODO: We probably want to provide a batch endpoint
async function PATCH(request: NextRequest, { params }: { params: Promise<{ playlistId: string, songId: string }> }): Promise<NextResponse> {
    const { playlistId, songId } = await params;
    const playlistIdNum = Number(playlistId);
    const songMappingIdNum = Number(songId);

    if (Number.isNaN(playlistIdNum) || Number.isNaN(songMappingIdNum)) {
        return NextResponse.json({ message: 'Invalid path parameters' }, { status: 400 });
    }

    // TODO: Validate user owns playlist/song mapping
    const userId = Number(request.cookies.get('userId')?.value);
    if (!userId) return NextResponse.json({ message: 'No user id found' }, { status: 401 });

    try {
        // TODO: Handle deserialization and validation better
        const update = await request.json() as PlaylistMappingUpdate;
        await songMappingService.updateSongMapping(playlistIdNum, songMappingIdNum, update);
        return new NextResponse(null, { status: 204 });
    } catch (Error) {
        console.error(Error);
        return NextResponse.json({}, { status: 500 });
    }
}

export { PATCH };
