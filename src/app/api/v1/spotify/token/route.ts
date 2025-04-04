import spotifyClient from "@/services/api/spotify/accounts";
import { NextRequest, NextResponse } from "next/server";

async function GET(request: NextRequest) {
  const urlParams = request.nextUrl.searchParams;
  const code = urlParams.get('code');
  const verifier = urlParams.get('verifier');

  if (!code) return new Response('No code provided', { status: 400 });
  if (!verifier) return new Response('No verifier provided', { status: 400 });

  try {
    const response = await spotifyClient.token(code, verifier);

    const res = new NextResponse();

    res.cookies.set('spotify_token', response.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60,
    });

    res.cookies.set('spotify_refresh_token', response.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60,
    });

    return res;
  } catch (error) {
    console.error('Failed to get token:', error);
    return new Response('Failed to get token', { status: 500 });
  }
}

export { GET };
