import { NextRequest, NextResponse } from "next/server";
import spotifyService from "@/services/spotify";

async function POST(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const body = await request.json();
  const { uris } = body;

  const token = request.cookies.get('spotify_token')?.value;
  const playlistId = params.id;

  if (!token) return new NextResponse('No token found', { status: 401 });
  if (!uris) return new NextResponse('Missing required fields', { status: 400 });
  if (!playlistId) return new NextResponse('Missing required fields', { status: 400 });

  const response = await spotifyService.addTracksToPlaylist(token, playlistId, uris);
  return new NextResponse(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' }, status: 201 });
}

export { POST };
