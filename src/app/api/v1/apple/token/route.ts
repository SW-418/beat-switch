import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from 'fs';
import jwt from 'jsonwebtoken';

// TODO: Need to add Auth method for these endpoints to prevent them being called by anyone
async function GET(request: NextRequest): Promise<NextResponse> {
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;

  // Probably pull this from AWS secrets for deployed versions
  const privateKeyPath = path.join(process.cwd(), 'keys', 'apple.p8');
  const privateKey = await fs.readFile(privateKeyPath, 'utf8');
  
  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: teamId,
    header: {
      alg: 'ES256',
      kid: keyId,
    },
  });
  return NextResponse.json({ token: token });
}

export { GET };
