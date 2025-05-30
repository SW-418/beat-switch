import PlaylistService from "@/services/playlist";
import { NextRequest, NextResponse } from "next/server";
import { SyncPlaylist } from "@/app/types/responses/sync-playlist";

const playlistService = new PlaylistService();

// This should return all playlists - Currently just a hack to return the saved playlist    
async function GET(request: NextRequest) {
    const userId = Number(request.cookies.get('userId')?.value);
    if (!userId) return NextResponse.json({ message: 'No user id found' }, { status: 401 });

    const playlists = await playlistService.getUserPlaylists(userId);
    const responsePlaylists = playlists
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(p => ({
        id: p.id.toString(),
        name: p.name,
        status: p.status
    }) satisfies SyncPlaylist);

    return NextResponse.json([responsePlaylists[0]]);
}

export { GET };
