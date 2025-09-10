import { generateCodeVerifier, generateCodeChallenge } from "./pkceUtil";

const clientID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUrl = process.env.REACT_APP_REDIRECT_URI;
const scope = "playlist-modify-public playlist-modify-private user-read-private user-read-email";
let userId;

function isTokenExpired() {
    const expiry = localStorage.getItem("expires_at");
    return !expiry || Date.now() > parseInt(expiry);
}

async function getCurrentUserId() {
    if (userId) return userId;

    const token = await Spotify.getAccessToken();
    if (!token) return null;

    try {
        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        userId = data.id;
        return userId;
    } catch (err) {
        console.error("Failed to get user ID", err);
        return null;
    }
}

const Spotify = {
    async initiateAuthFlow() {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateCodeVerifier(); // ใช้ random string เป็น state

        sessionStorage.setItem("spotify_code_verifier", codeVerifier);
        sessionStorage.setItem("spotify_auth_state", state);

        const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
            response_type: "code",
            client_id: clientID,
            scope,
            redirect_uri: redirectUrl,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
            state,
        })}`;

        window.location.href = authUrl;
    },

    async handleRedirect() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const returnedState = params.get("state");

        if (!code) return;

        const storedState = sessionStorage.getItem("spotify_auth_state");
        const codeVerifier = sessionStorage.getItem("spotify_code_verifier");

        if (!codeVerifier || !storedState || returnedState !== storedState) {
            console.error("Missing or mismatched code_verifier/state");
            return;
        }

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUrl,
            client_id: clientID,
            code_verifier: codeVerifier,
        });

        try {
            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString(),
            });

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem("access_token", data.access_token);
                localStorage.setItem("expires_at", Date.now() + data.expires_in * 1000);

                sessionStorage.removeItem("spotify_code_verifier");
                sessionStorage.removeItem("spotify_auth_state");

                // ✅ เคลียร์ query string
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                console.error("Token exchange failed", data);
            }
        } catch (err) {
            console.error("Network error during token exchange", err);
        }
    },

    async getAccessToken() {
        const token = localStorage.getItem("access_token");
        if (token && !isTokenExpired()) {
            return token;
        }
        return null;
    },

    async search(term) {
        const token = await Spotify.getAccessToken();
        if (!token) {
            await Spotify.initiateAuthFlow();
            return [];
        }

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const json = await response.json();
            if (!json.tracks || !Array.isArray(json.tracks.items)) return [];

            const flaggedTracks = json.tracks.items.map((track) => {
                if (!track || !track.id || !track.uri || typeof track.name !== "string" || track.name.trim() === "") {
                    return { flag: "ghost", raw: track };
                }
                if (track.is_local) {
                    return { flag: "local", raw: track };
                }
                return { flag: "valid", raw: track };
            });

            console.log("🔍 Search results flagged:", flaggedTracks.map((t) => `${t.raw?.name || "null"} → ${t.flag}`));

            return flaggedTracks
                .filter((t) => t.flag === "valid")
                .map((t) => ({
                    id: t.raw.id,
                    name: t.raw.name,
                    artist: t.raw.artists?.[0]?.name ?? "Unknown Artist",
                    album: t.raw.album?.name ?? "Unknown Album",
                    uri: t.raw.uri,
                    preview_url: t.raw.preview_url,
                }));
        } catch (err) {
            console.error("Search failed", err);
            return [];
        }
    },

    async getPlaylistTracks(playlistId) {
        const token = await Spotify.getAccessToken();
        if (!token) return [];

        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            const flaggedTracks = data.items.map((item) => {
                const t = item.track;
                if (!t || !t.id || !t.uri || typeof t.name !== "string" || t.name.trim() === "") {
                    return { flag: "ghost", raw: t };
                }
                if (t.is_local) {
                    return { flag: "local", raw: t };
                }
                return { flag: "valid", raw: t };
            });

            console.log("🎧 Playlist tracks flagged:", flaggedTracks.map((t) => `${t.raw?.name || "null"} → ${t.flag}`));

            return flaggedTracks
                .filter((t) => t.flag === "valid")
                .map((t) => ({
                    id: t.raw.id,
                    name: t.raw.name,
                    artist: t.raw.artists?.[0]?.name ?? "Unknown Artist",
                    album: t.raw.album?.name ?? "Unknown Album",
                    uri: t.raw.uri,
                    preview_url: t.raw.preview_url,
                }));
        } catch (err) {
            console.error("Failed to fetch playlist tracks", err);
            return [];
        }
    },

    async addTracksToPlaylist(playlistId, trackURIs) {
        const token = await Spotify.getAccessToken();
        if (!token || !trackURIs || trackURIs.length === 0) return false;

        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uris: trackURIs }),
            });

            const result = await response.json();
            if (!response.ok) {
                console.error("Spotify API error:", result);
                return false;
            }

            return true;
        } catch (err) {
            console.error("Failed to add tracks to playlist", err);
            return false;
        }
    },

    async removeTrackFromPlaylist(playlistId, trackUri) {
        const token = await Spotify.getAccessToken();
        if (!token || !trackUri) return false;

        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tracks: [{ uri: trackUri }],
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                console.error("Failed to remove track:", result);
                return false;
            }

            console.log("🗑 Track removed. Snapshot ID:", result.snapshot_id);
            return true;
        } catch (err) {
            console.error("Failed to remove track from playlist", err);
            return false;
        }
    },

    async savePlaylist(name, trackURIs) {
        const token = await Spotify.getAccessToken();
        if (!token) return false;

        try {
            const userRes = await fetch("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userId = (await userRes.json()).id;

            const playlistRes = await fetch(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name }),
                }
            );
            const playlistId = (await playlistRes.json()).id;

            await Spotify.addTracksToPlaylist(playlistId, trackURIs);
            return true;
        } catch (err) {
            console.error("Failed to save playlist", err);
            return false;
        }
    },

    async getUserPlaylists() {
        const token = await Spotify.getAccessToken();
        if (!token) return [];

        const id = await getCurrentUserId();
        if (!id) return [];

        try {
            const response = await fetch(`https://api.spotify.com/v1/users/${id}/playlists`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            return data.items.map((playlist) => ({
                playlistId: playlist.id,
                name: playlist.name,
            }));
        } catch (err) {
            console.error("Failed to fetch user playlists", err);
            return [];
        }
    },
};

export { Spotify };