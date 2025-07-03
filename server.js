// Servidor para mostrar las estadísticas de Spotify de Mario
// Este archivo debe ejecutarse en un servidor Node.js

const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Spotify
const SPOTIFY_CLIENT_ID = '94e0c3686a28482d80a93b4adcd10ce6';
const SPOTIFY_CLIENT_SECRET = 'd1e2041846154896a69d52b946d0e22b';
// Para desarrollo local, usaremos GitHub Pages como redirect
const REDIRECT_URI = 'https://wolverine307mda.github.io/callback';

app.use(cors());
app.use(express.json());

// Configurar cabeceras de seguridad flexibles para desarrollo
app.use((req, res, next) => {
    // Permitir scripts inline para desarrollo
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: https: http:; " +
        "connect-src 'self' https://api.spotify.com https://accounts.spotify.com;"
    );
    next();
});

app.use(express.static(__dirname));

// Middleware de logging para debug
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Ruta principal para servir el portfolio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para el panel de administración
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Almacenamiento en memoria para los tokens de Mario (en producción, usa una base de datos)
let marioTokens = {
    access_token: null,
    refresh_token: null,
    expires_at: null
};

// Cache para las estadísticas de Mario (se actualiza cada 5 minutos)
let marioStatsCache = {
    data: null,
    lastUpdate: null,
    cacheTime: 5 * 60 * 1000 // 5 minutos en milisegundos
};

// ENDPOINT PÚBLICO: Obtener estadísticas de Mario (sin autenticación)
app.get('/api/mario-stats', async (req, res) => {
    try {
        // Verificar si tenemos datos en cache válidos
        const now = Date.now();
        if (marioStatsCache.data && marioStatsCache.lastUpdate && 
            (now - marioStatsCache.lastUpdate) < marioStatsCache.cacheTime) {
            return res.json(marioStatsCache.data);
        }

        // Verificar si Mario tiene tokens válidos
        if (!marioTokens.access_token) {
            return res.status(503).json({ 
                error: 'No hay tokens de Mario disponibles. El administrador debe autorizar primero.' 
            });
        }

        // Verificar si el token ha expirado
        if (marioTokens.expires_at && Date.now() > marioTokens.expires_at) {
            if (marioTokens.refresh_token) {
                await refreshMarioToken();
            } else {
                return res.status(503).json({ 
                    error: 'Los tokens de Mario han expirado. Se requiere reautorización.' 
                });
            }
        }

        // Obtener estadísticas de Mario desde Spotify
        const stats = await getMarioStatsFromSpotify();
        
        // Actualizar cache
        marioStatsCache.data = stats;
        marioStatsCache.lastUpdate = now;
        
        res.json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas de Mario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ENDPOINT DE ADMINISTRACIÓN: Solo para que Mario se autentique (protegido)
app.get('/admin/auth/spotify', (req, res) => {
    const state = generateRandomString(16);
    const scope = 'user-read-private user-read-email user-top-read user-read-recently-played user-read-currently-playing user-read-playback-state';

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            state: state
        }));
});

// Endpoint para intercambiar código por tokens (solo para Mario)
app.post('/admin/exchange-token', async (req, res) => {
    const { code, state } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }), {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // Guardar tokens de Mario
        marioTokens.access_token = response.data.access_token;
        marioTokens.refresh_token = response.data.refresh_token;
        marioTokens.expires_at = Date.now() + (response.data.expires_in * 1000);

        console.log('Tokens de Mario guardados exitosamente');
        
        // Limpiar cache para forzar actualización
        marioStatsCache.data = null;
        marioStatsCache.lastUpdate = null;

        res.json({ success: true, message: 'Mario autorizado exitosamente' });
    } catch (error) {
        console.error('Error al intercambiar código por tokens:', error);
        res.status(400).json({ error: 'invalid_token' });
    }
});

// Callback de Spotify (redirige a GitHub Pages)
app.get('/callback', (req, res) => {
    // Este endpoint redirige a GitHub Pages con los parámetros
    res.redirect('https://wolverine307mda.github.io/callback.html' + '?' + req.url.split('?')[1]);
});

// Función para refrescar el token de Mario
async function refreshMarioToken() {
    if (!marioTokens.refresh_token) {
        throw new Error('No refresh token disponible para Mario');
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: marioTokens.refresh_token
            }), {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        marioTokens.access_token = response.data.access_token;
        marioTokens.expires_at = Date.now() + (response.data.expires_in * 1000);
        
        // Si hay un nuevo refresh token, lo guardamos
        if (response.data.refresh_token) {
            marioTokens.refresh_token = response.data.refresh_token;
        }

        console.log('Token de Mario refrescado exitosamente');
    } catch (error) {
        console.error('Error al refrescar token de Mario:', error);
        throw error;
    }
}

// Función para obtener estadísticas de Mario desde Spotify
async function getMarioStatsFromSpotify() {
    const headers = {
        'Authorization': `Bearer ${marioTokens.access_token}`
    };

    try {
        // Obtener múltiples datos en paralelo
        const [
            topTracks,
            topArtists,
            recentlyPlayed,
            currentlyPlaying,
            userProfile
        ] = await Promise.allSettled([
            axios.get('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term', { headers }),
            axios.get('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term', { headers }),
            axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=10', { headers }),
            axios.get('https://api.spotify.com/v1/me/player/currently-playing', { headers }),
            axios.get('https://api.spotify.com/v1/me', { headers })
        ]);

        return {
            topTracks: topTracks.status === 'fulfilled' ? topTracks.value.data : { items: [] },
            topArtists: topArtists.status === 'fulfilled' ? topArtists.value.data : { items: [] },
            recentlyPlayed: recentlyPlayed.status === 'fulfilled' ? recentlyPlayed.value.data : { items: [] },
            currentlyPlaying: currentlyPlaying.status === 'fulfilled' ? currentlyPlaying.value.data : null,
            userProfile: userProfile.status === 'fulfilled' ? userProfile.value.data : null,
            lastUpdate: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error al obtener datos de Spotify:', error);
        throw error;
    }
}

// ENDPOINT DE ADMINISTRACIÓN: Estado del servidor (para Mario)
app.get('/admin/status', (req, res) => {
    res.json({
        marioTokensValid: !!marioTokens.access_token,
        tokenExpiry: marioTokens.expires_at,
        cacheLastUpdate: marioStatsCache.lastUpdate,
        cacheValid: marioStatsCache.data && marioStatsCache.lastUpdate && 
                   (Date.now() - marioStatsCache.lastUpdate) < marioStatsCache.cacheTime
    });
});

// Endpoint para refrescar manualmente el token (para administración)
app.post('/admin/refresh-token', async (req, res) => {
    try {
        await refreshMarioToken();
        res.json({ success: true, message: 'Token refrescado exitosamente' });
    } catch (error) {
        console.error('Error al refrescar token:', error);
        res.status(400).json({ error: 'Error al refrescar token' });
    }
});

// Función auxiliar
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
    console.log(`📄 Archivo index.html: ${path.join(__dirname, 'index.html')}`);
    console.log(`🔧 Configura tu Spotify App con la URL de callback: ${REDIRECT_URI}`);
    console.log(`\n🎵 PANEL DE ADMINISTRACIÓN (Mario):`);
    console.log(`   🔐 Autorizar Spotify: http://localhost:${PORT}/admin/auth/spotify`);
    console.log(`   📊 Panel de admin: http://localhost:${PORT}/admin.html`);
    console.log(`   📈 Ver estado: http://localhost:${PORT}/admin/status`);
    console.log(`\n🌐 PARA VISITANTES:`);
    console.log(`   🏠 Portfolio: http://localhost:${PORT}/`);
    console.log(`   📊 Estadísticas API: http://localhost:${PORT}/api/mario-stats`);
    console.log(`\n⚡ Presiona Ctrl+C para detener el servidor`);
});

module.exports = app;
