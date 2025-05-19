
class LoginClient {
    constructor() {}

    async loginWithSpotify(accountId: string): Promise<void> {
        console.log('Logging in with Spotify');
        const url = new URL('/api/v1/login', window.location.origin);
        url.searchParams.set('accountId', accountId);
        url.searchParams.set('accountType', 'SPOTIFY');

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to login with Spotify');

        await response.json();
    }
}

export default new LoginClient();
