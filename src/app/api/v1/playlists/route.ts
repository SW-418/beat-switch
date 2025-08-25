import PlaylistService from "@/services/playlist";
import { NextRequest, NextResponse } from "next/server";
import { SyncPlaylist } from "@/app/types/api/responses/sync-playlist";

const playlistService = new PlaylistService();

// This should return all playlists - Currently just a hack to return the saved playlist    
async function GET(request: NextRequest) {
    const userId = Number(request.cookies.get('userId')?.value);
    if (!userId) return NextResponse.json({ message: 'No user id found' }, { status: 401 });

    const playlists = await playlistService.getUserPlaylists(userId);
    
    if (playlists.length === 0) return NextResponse.json([], { status: 200 });

    const responsePlaylists = playlists
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        mappingCounts: p.mappingCounts
    }) satisfies SyncPlaylist);

    return NextResponse.json([responsePlaylists[0]]);
}

export { GET };
