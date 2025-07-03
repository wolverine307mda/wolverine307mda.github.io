// Configuración de Spotify
const SPOTIFY_CONFIG = {
    serverUrl: 'http://localhost:3000', // URL de tu servidor
    scopes: [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'user-read-currently-playing',
        'user-read-playback-state'
    ]
};

class SpotifyAPI {
    constructor() {
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.refreshToken = localStorage.getItem('spotify_refresh_token');
        this.tokenExpiry = localStorage.getItem('spotify_token_expiry');
        
        // Verificar si hay tokens en la URL (después del callback)
        this.checkUrlForTokens();
    }

    // Verificar tokens en la URL
    checkUrlForTokens() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        
        if (accessToken) {
            this.saveTokens(accessToken, refreshToken, parseInt(expiresIn));
            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Recargar estadísticas
            if (window.spotifyStats) {
                window.spotifyStats.loadStats();
            }
        }
    }

    // Generar URL de autorización - ahora usa el servidor
    getAuthUrl() {
        return `${SPOTIFY_CONFIG.serverUrl}/auth/spotify`;
    }

    // Generar string aleatorio para seguridad
    generateRandomString(length) {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    // Verificar si el token está válido
    isTokenValid() {
        if (!this.accessToken || !this.tokenExpiry) return false;
        return Date.now() < parseInt(this.tokenExpiry);
    }

    // Obtener datos del usuario
    async getUserProfile() {
        const response = await this.makeAuthenticatedRequest('https://api.spotify.com/v1/me');
        
        if (!response.ok) {
            throw new Error('Error al obtener perfil del usuario');
        }

        return response.json();
    }

    // Obtener artistas más escuchados
    async getTopArtists(timeRange = 'medium_term', limit = 10) {
        const response = await this.makeAuthenticatedRequest(
            `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error('Error al obtener top artistas');
        }

        return response.json();
    }

    // Obtener canciones más escuchadas
    async getTopTracks(timeRange = 'medium_term', limit = 10) {
        const response = await this.makeAuthenticatedRequest(
            `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error('Error al obtener top canciones');
        }

        return response.json();
    }

    // Obtener canción actual
    async getCurrentTrack() {
        const response = await this.makeAuthenticatedRequest(
            'https://api.spotify.com/v1/me/player/currently-playing'
        );

        if (response.status === 204) {
            return null; // No hay música reproduciéndose
        }

        if (!response.ok) {
            throw new Error('Error al obtener canción actual');
        }

        return response.json();
    }

    // Obtener historial reciente
    async getRecentlyPlayed(limit = 20) {
        const response = await this.makeAuthenticatedRequest(
            `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`
        );

        if (!response.ok) {
            throw new Error('Error al obtener historial reciente');
        }

        return response.json();
    }

    // Guardar tokens
    saveTokens(accessToken, refreshToken, expiresIn) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = Date.now() + (expiresIn * 1000);

        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_refresh_token', refreshToken);
        localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
    }

    // Limpiar tokens
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;

        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiry');
    }

    // Refrescar token cuando sea necesario
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No hay refresh token disponible');
        }

        try {
            const response = await fetch(`${SPOTIFY_CONFIG.serverUrl}/refresh_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: this.refreshToken
                })
            });

            if (!response.ok) {
                throw new Error('Error al refrescar token');
            }

            const data = await response.json();
            this.saveTokens(data.access_token, this.refreshToken, data.expires_in);
            
            return data.access_token;
        } catch (error) {
            console.error('Error al refrescar token:', error);
            this.clearTokens();
            throw error;
        }
    }

    // Hacer petición con manejo automático de refresh
    async makeAuthenticatedRequest(url, options = {}) {
        if (!this.isTokenValid()) {
            if (this.refreshToken) {
                await this.refreshAccessToken();
            } else {
                throw new Error('Token inválido y no hay refresh token');
            }
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        // Si el token expiró, intentar refrescar
        if (response.status === 401 && this.refreshToken) {
            await this.refreshAccessToken();
            return fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
        }

        return response;
    }
}

// Instancia global
const spotifyAPI = new SpotifyAPI();
