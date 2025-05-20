import { NextRequest, NextResponse } from "next/server";
import spotifyService from "@/services/spotify";

async function POST(request: NextRequest): Promise<NextResponse> {
    const userId = Number(request.cookies.get('userId')?.value);
    if (!userId) return NextResponse.json({ message: 'No user id found' }, { status: 401 });

    const token = request.cookies.get('spotify_token')?.value;
    if (!token) return NextResponse.json({ message: 'No token found' }, { status: 401 });

    // TODO: We need to mark a sync in progress so there can only be one at a time
    spotifyService.syncSavedTracks(userId, token);

    // Return 202 to indicate sync will be processed in the background
    return NextResponse.json({ message: 'Track sync initiated' }, { status: 202 });
}

export { POST };
