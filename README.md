# Beat Switch

Full stack application using React/NextJS/TypeScript.

Playing around with Music APIs. I'm trying out Apple Music after a long time on Spotify.

Currently requires Spotify API key (client id) which can be created via the Spotify Developer Dashboard.

Current functionality:
- Generate Spotify playlist from top tracks
- Generate Spotify playlist from saved tracks

Future functionality:
- Transfer playlist from Spotify to Apple Music
- Transfer saved songs from Spotify to Apple Music

## Setup

```bash
# 1. Start the database
docker compose up -d

# 2. Install dependencies
yarn

# 3. Setup database schema and generate Prisma client
yarn db:setup

# 4. Seed database with initial data
yarn db:seed
```

### Environment Variables

Create a `.env` file in the root directory with:

```env
DATABASE_URL="postgresql://beat-switch:beat-switch@localhost:5433/beat-switch"

# Spotify API credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Apple Music API credentials
APPLE_MUSIC_TEAM_ID=your_apple_team_id
APPLE_MUSIC_KEY_ID=your_apple_music_key_id
# Note: Also place your Apple Music private key file at: keys/apple.p8
```

## Development

```bash
# Start development server
yarn dev
```

Navigate to [http://localhost:3000](http://localhost:3000)
- Hot reload enabled
- Changes will refresh automatically
