// Gestión de estadísticas de Spotify en tiempo real
class SpotifyStats {
    constructor() {
        this.updateInterval = null;
        this.isUpdating = false;
    }

    // Inicializar estadísticas
    async init() {
        try {
            // Verificar si hay tokens guardados
            if (spotifyAPI.isTokenValid()) {
                await this.loadStats();
                this.startRealTimeUpdates();
            } else {
                this.showConnectButton();
            }
        } catch (error) {
            console.error('Error al inicializar Spotify:', error);
            this.showConnectButton();
        }
    }

    // Mostrar botón de conexión
    showConnectButton() {
        const musicSection = document.querySelector('.music-showcase');
        if (musicSection) {
            musicSection.innerHTML = `
                <div class="spotify-connect">
                    <div class="connect-card">
                        <i class="fab fa-spotify spotify-icon"></i>
                        <h3>Conecta con Spotify</h3>
                        <p>Conecta tu cuenta de Spotify para ver tus estadísticas reales en tiempo real</p>
                        <button id="connectSpotify" class="btn btn-spotify">
                            <i class="fab fa-spotify"></i> Conectar con Spotify
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('connectSpotify').addEventListener('click', () => {
                window.location.href = spotifyAPI.getAuthUrl();
            });
        }
    }

    // Cargar estadísticas desde Spotify
    async loadStats() {
        try {
            this.isUpdating = true;
            
            // Obtener datos en paralelo
            const [topArtists, topTracks, currentTrack, recentlyPlayed] = await Promise.all([
                spotifyAPI.getTopArtists('medium_term', 4),
                spotifyAPI.getTopTracks('medium_term', 10),
                spotifyAPI.getCurrentTrack(),
                spotifyAPI.getRecentlyPlayed(50)
            ]);

            // Actualizar estadísticas generales
            this.updateGeneralStats(topTracks, recentlyPlayed);
            
            // Actualizar showcase de artistas
            this.updateArtistsShowcase(topArtists);
            
            // Mostrar canción actual si está reproduciéndose
            this.updateCurrentTrack(currentTrack);

            this.isUpdating = false;
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            this.isUpdating = false;
        }
    }

    // Actualizar estadísticas generales
    updateGeneralStats(topTracks, recentlyPlayed) {
        const musicStats = document.querySelector('.music-stats');
        if (musicStats && topTracks && recentlyPlayed) {
            // Calcular géneros únicos
            const genres = new Set();
            topTracks.items.forEach(track => {
                track.artists.forEach(artist => {
                    // Nota: necesitarías otra llamada a la API para obtener géneros de artistas
                });
            });

            // Calcular tiempo de escucha aproximado
            const hoursPerDay = Math.round(recentlyPlayed.items.length / 7 * 24 / 50 * 3); // Aproximación

            musicStats.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${hoursPerDay}h</span>
                    <span class="stat-label">Música diaria</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${topTracks.items.length}</span>
                    <span class="stat-label">Top canciones</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">En vivo</span>
                    <span class="stat-label">Datos reales</span>
                </div>
            `;
        }
    }

    // Actualizar showcase de artistas
    updateArtistsShowcase(topArtists) {
        const musicShowcase = document.querySelector('.music-showcase');
        if (musicShowcase && topArtists) {
            musicShowcase.innerHTML = topArtists.items.map(artist => `
                <div class="music-card">
                    <div class="music-cover" style="background-image: url('${artist.images[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}');">
                        <div class="music-overlay">
                            <h4>${artist.name}</h4>
                            <p>${artist.genres.slice(0, 2).join(', ') || 'Artista'}</p>
                            <a class="music-spotify" href="${artist.external_urls.spotify}" target="_blank" title="Ver en Spotify">♪</a>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Actualizar canción actual
    updateCurrentTrack(currentTrack) {
        const currentSongElement = document.getElementById('currentSong');
        
        if (currentTrack && currentTrack.item) {
            if (!currentSongElement) {
                // Crear elemento para canción actual
                const musicSection = document.querySelector('.hobby-section:has(.music-showcase)');
                if (musicSection) {
                    const currentSongDiv = document.createElement('div');
                    currentSongDiv.id = 'currentSong';
                    currentSongDiv.className = 'current-song';
                    musicSection.insertBefore(currentSongDiv, musicSection.querySelector('.music-showcase'));
                }
            }

            const element = document.getElementById('currentSong');
            if (element) {
                element.innerHTML = `
                    <div class="now-playing">
                        <div class="now-playing-info">
                            <div class="now-playing-image">
                                <img src="${currentTrack.item.album.images[0]?.url || 'https://via.placeholder.com/64x64'}" alt="Album cover">
                                <div class="playing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                            <div class="now-playing-text">
                                <h4>🎵 Escuchando ahora</h4>
                                <p><strong>${currentTrack.item.name}</strong> - ${currentTrack.item.artists.map(a => a.name).join(', ')}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // Remover elemento si no hay música
            if (currentSongElement) {
                currentSongElement.remove();
            }
        }
    }

    // Iniciar actualizaciones en tiempo real
    startRealTimeUpdates() {
        // Actualizar canción actual cada 30 segundos
        this.updateInterval = setInterval(async () => {
            if (!this.isUpdating) {
                try {
                    const currentTrack = await spotifyAPI.getCurrentTrack();
                    this.updateCurrentTrack(currentTrack);
                } catch (error) {
                    console.error('Error al actualizar canción actual:', error);
                }
            }
        }, 30000);

        // Actualizar estadísticas completas cada 5 minutos
        setInterval(async () => {
            if (!this.isUpdating) {
                await this.loadStats();
            }
        }, 300000);
    }

    // Detener actualizaciones
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Desconectar de Spotify
    disconnect() {
        this.stopRealTimeUpdates();
        spotifyAPI.clearTokens();
        this.showConnectButton();
    }
}

// Instancia global
const spotifyStats = new SpotifyStats();

// Manejar callback de autenticación
function handleSpotifyCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
        console.error('Error en autenticación:', error);
        return;
    }

    if (code) {
        // Aquí necesitarías intercambiar el código por tokens
        // Esto requiere un servidor backend por seguridad
        console.log('Código recibido:', code);
        // Redirigir a página principal
        window.location.href = window.location.origin + '/#hobbies';
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si es callback de Spotify
    if (window.location.search.includes('code=')) {
        handleSpotifyCallback();
    } else {
        // Inicializar estadísticas
        spotifyStats.init();
    }
});

// Limpiar intervalos cuando se cierra la página
window.addEventListener('beforeunload', () => {
    spotifyStats.stopRealTimeUpdates();
});
