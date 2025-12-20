const axios = require("axios");

class SpotifyService {
    constructor() {
        this.clientId = process.env.SPOTIFY_CLIENT_ID;
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Spotify Access Token алу
    async getAccessToken() {
        // Токен әлі жарамды болса, қайта сұрамау
        if (this.accessToken && this.tokenExpiry > Date.now()) {
            return this.accessToken;
        }

        try {
            const auth = Buffer.from(
                `${this.clientId}:${this.clientSecret}`
            ).toString("base64");

            const response = await axios.post(
                "https://accounts.spotify.com/api/token",
                "grant_type=client_credentials",
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

            return this.accessToken;
        } catch (error) {
            throw new Error("Spotify токенін алу мүмкін болмады");
        }
    }

    // Артистті іздеу
    async searchArtist(artistName) {
        const token = await this.getAccessToken();

        try {
            const response = await axios.get(
                "https://api.spotify.com/v1/search",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        q: artistName,
                        type: "artist",
                        limit: 1,
                    },
                }
            );

            if (response.data.artists.items.length === 0) {
                return null;
            }

            return response.data.artists.items[0];
        } catch (error) {
            throw new Error("Артистті іздеу мүмкін болмады");
        }
    }

    // Артисттің топ-тректерін алу
    async getArtistTopTracks(artistName) {
        const artist = await this.searchArtist(artistName);

        if (!artist) {
            throw new Error("Артист табылмады");
        }

        const token = await this.getAccessToken();

        try {
            const response = await axios.get(
                `https://api.spotify.com/v1/artists/${artist.id}/top-tracks`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        market: "US",
                    },
                }
            );

            // Деректерді ішкі форматқа өңдеу (маппинг)
            return response.data.tracks.map((track) => ({
                title: track.name,
                artist: artist.name,
                album: track.album.name,
                duration: Math.floor(track.duration_ms / 1000),
                releaseYear: new Date(track.album.release_date).getFullYear(),
                spotifyId: track.id,
                previewUrl: track.preview_url,
                popularity: track.popularity,
            }));
        } catch (error) {
            throw new Error("Тректерді алу мүмкін болмады");
        }
    }
}

module.exports = new SpotifyService();
