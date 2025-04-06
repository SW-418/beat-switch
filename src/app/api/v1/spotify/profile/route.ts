import { NextRequest, NextResponse } from "next/server";
import spotifyClient from "@/data-access/spotify/users";

async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('spotify_token')?.value;

  if (!token) return NextResponse.json({ message: 'No token found' }, { status: 401 });
  
  const profile = await spotifyClient.getProfile(token);

  return NextResponse.json({ 
    displayName: profile.display_name,
    id: profile.id
  });
}

export { GET };
