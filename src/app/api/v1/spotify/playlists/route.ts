import spotifyService from "@/services/spotify";
import { NextRequest, NextResponse } from "next/server";

async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { name, userId, description } = body;

  const token = request.cookies.get('spotify_token')?.value;

  if (!token) return new NextResponse('No token found', { status: 401 });
  if (!name || !userId) return new NextResponse('Missing required fields', { status: 400 });

  const playlistResponse = await spotifyService.createPlaylist(token, name, userId, description);
  return new NextResponse(JSON.stringify({ id: playlistResponse.id}), { headers: { 'Content-Type': 'application/json' }, status: 201 });
}

async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('spotify_token')?.value;
  if (!token) return new NextResponse('No token found', { status: 401 });

  const playlists = await spotifyService.getPlaylists(token);
  
  return new NextResponse(JSON.stringify(playlists), { headers: { 'Content-Type': 'application/json' }, status: 200 });
}

export { POST, GET };
