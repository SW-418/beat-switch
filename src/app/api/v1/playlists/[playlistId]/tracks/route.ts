import { NextRequest, NextResponse } from "next/server";
import PlaylistService from "@/services/playlist";
import { PlaylistNotFoundError, PlaylistUnauthorizedError } from "@/app/types/errors/playlist-errors";

const playlistService = new PlaylistService();

async function GET(request: NextRequest, { params }: { params: { playlistId: string } }): Promise<NextResponse> {
    const { playlistId } = await params;
    if (!playlistId) return NextResponse.json({ message: 'Playlist ID required' }, { status: 400 });

    const userId = Number(request.cookies.get('userId')?.value);
    if (!userId) return NextResponse.json({ message: 'No user id found' }, { status: 401 });

    const unmappedOnly = request.nextUrl.searchParams.get('unmappedOnly') === 'true';

    try {
        const tracks = await playlistService.getPlaylistTracks(Number(playlistId), userId, unmappedOnly);
        return NextResponse.json(tracks);
    } catch (error) {
        switch (error) {
            case PlaylistNotFoundError:
                return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
            case PlaylistUnauthorizedError:
                return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
            default:
                console.error('Failed to retrieve playlist tracks', error);
                return NextResponse.json({ message: 'Failed to retrieve playlist tracks' }, { status: 500 });
        }
    }
}

export { GET };
