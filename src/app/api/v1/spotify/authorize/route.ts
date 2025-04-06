import { NextRequest, NextResponse } from "next/server";
import spotifyClient from "@/data-access/spotify/accounts";

async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { url, verifier } = await spotifyClient.authorize();
        return NextResponse.json({ url, verifier }, { status: 200 });
    } catch(error) {
        console.error('Failed to get authorization URL:', error);
        return NextResponse.json({ message: 'Failed to get authorization URL' }, { status: 500 });
    }
}

export { GET };
