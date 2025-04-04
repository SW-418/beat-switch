import spotifyClient from "@/services/api/spotify/users";
import { NextRequest, NextResponse } from "next/server";

async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('spotify_token')?.value;
  
  // TODO: Add token validation middleware
  // TODO: Add reusable error response type
  if (!token) return new NextResponse('No token found', { status: 401 });

  const tracks = await spotifyClient.getTopTracks(token);
  return new NextResponse(JSON.stringify(tracks), { headers: { 'Content-Type': 'application/json' } })
}

export { GET };
