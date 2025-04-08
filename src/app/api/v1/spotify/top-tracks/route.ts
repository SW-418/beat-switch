import spotifyService from "@/services/spotify";
import { NextRequest, NextResponse } from "next/server";

async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('spotify_token')?.value;
  
  // TODO: Add token validation middleware
  // TODO: Add reusable error response type
  if (!token) return new NextResponse('No token found', { status: 401 });

  const limit = request.nextUrl.searchParams.get('limit') || 50;
  const offset = request.nextUrl.searchParams.get('offset') || 0;
  
  const tracks = await spotifyService.getTopTracks(token, Number(limit), Number(offset));
  return new NextResponse(JSON.stringify(tracks), { headers: { 'Content-Type': 'application/json' } })
}

export { GET };
