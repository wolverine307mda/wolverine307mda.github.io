// Mostrar estadísticas de Spotify de Mario (sin autenticación)
// Este archivo reemplaza spotify.js y spotify-stats.js para una implementación más simple

class MarioSpotifyStats {
    constructor() {
        this.serverUrl = 'http://localhost:3000'; // Cambiar por la URL de tu servidor en producción
        this.apiUrl = `${this.serverUrl}/api/mario-stats`;
        this.statsContainer = document.getElementById('spotify-stats');
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadMarioStats();
        
        // Actualizar estadísticas cada 5 minutos
        setInterval(() => {
            this.loadMarioStats();
        }, 5 * 60 * 1000);
    }

    showLoading() {
        if (this.statsContainer) {
            this.statsContainer.innerHTML = `
                <div class="spotify-loading">
                    <div class="loading-spinner"></div>
                    <p>Cargando estadísticas musicales de Mario...</p>
                </div>
            `;
        }
    }

    async loadMarioStats() {
        try {
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.displayStats(data);
            this.retryCount = 0; // Resetear contador de reintentos
            
        } catch (error) {
            console.error('Error al cargar estadísticas de Mario:', error);
            this.handleError(error);
        }
    }

    displayStats(data) {
        if (!this.statsContainer) return;

        const html = `
            <div class="spotify-stats-content">
                <div class="spotify-header">
                    <h3>🎵 Mis Gustos Musicales</h3>
                    <p class="spotify-subtitle">Estas son mis estadísticas reales de Spotify</p>
                </div>

                <div class="spotify-sections">
                    ${this.renderCurrentlyPlaying(data.currentlyPlaying)}
                    ${this.renderTopTracks(data.topTracks)}
                    ${this.renderTopArtists(data.topArtists)}
                    ${this.renderRecentlyPlayed(data.recentlyPlayed)}
                </div>

                <div class="spotify-footer">
                    <p class="last-update">Última actualización: ${this.formatDate(data.lastUpdate)}</p>
                </div>
            </div>
        `;

        this.statsContainer.innerHTML = html;
    }

    renderCurrentlyPlaying(currentTrack) {
        if (!currentTrack || !currentTrack.item) {
            return `
                <div class="spotify-section">
                    <h4>🎧 Ahora Escuchando</h4>
                    <p class="no-music">No hay música reproduciéndose actualmente</p>
                </div>
            `;
        }

        const track = currentTrack.item;
        const artists = track.artists.map(artist => artist.name).join(', ');
        const isPlaying = currentTrack.is_playing;

        return `
            <div class="spotify-section current-playing">
                <h4>🎧 ${isPlaying ? 'Escuchando Ahora' : 'Última Canción'}</h4>
                <div class="track-info">
                    <img src="${track.album.images[0]?.url || ''}" alt="${track.name}" class="track-image">
                    <div class="track-details">
                        <p class="track-name">${track.name}</p>
                        <p class="track-artist">${artists}</p>
                        <p class="track-album">${track.album.name}</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderTopTracks(topTracks) {
        if (!topTracks || !topTracks.items || topTracks.items.length === 0) {
            return `
                <div class="spotify-section">
                    <h4>🔥 Mis Canciones Favoritas</h4>
                    <p class="no-data">No hay datos disponibles</p>
                </div>
            `;
        }

        const tracksHtml = topTracks.items.slice(0, 5).map((track, index) => {
            const artists = track.artists.map(artist => artist.name).join(', ');
            return `
                <div class="top-item">
                    <span class="item-number">${index + 1}</span>
                    <img src="${track.album.images[2]?.url || ''}" alt="${track.name}" class="item-image">
                    <div class="item-details">
                        <p class="item-name">${track.name}</p>
                        <p class="item-subtitle">${artists}</p>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="spotify-section">
                <h4>🔥 Mis Canciones Favoritas</h4>
                <div class="top-list">
                    ${tracksHtml}
                </div>
            </div>
        `;
    }

    renderTopArtists(topArtists) {
        if (!topArtists || !topArtists.items || topArtists.items.length === 0) {
            return `
                <div class="spotify-section">
                    <h4>🎤 Mis Artistas Favoritos</h4>
                    <p class="no-data">No hay datos disponibles</p>
                </div>
            `;
        }

        const artistsHtml = topArtists.items.slice(0, 5).map((artist, index) => {
            return `
                <div class="top-item">
                    <span class="item-number">${index + 1}</span>
                    <img src="${artist.images[2]?.url || ''}" alt="${artist.name}" class="item-image">
                    <div class="item-details">
                        <p class="item-name">${artist.name}</p>
                        <p class="item-subtitle">${artist.genres.slice(0, 2).join(', ')}</p>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="spotify-section">
                <h4>🎤 Mis Artistas Favoritos</h4>
                <div class="top-list">
                    ${artistsHtml}
                </div>
            </div>
        `;
    }

    renderRecentlyPlayed(recentTracks) {
        if (!recentTracks || !recentTracks.items || recentTracks.items.length === 0) {
            return `
                <div class="spotify-section">
                    <h4>⏰ Escuchado Recientemente</h4>
                    <p class="no-data">No hay datos disponibles</p>
                </div>
            `;
        }

        const tracksHtml = recentTracks.items.slice(0, 3).map((item) => {
            const track = item.track;
            const artists = track.artists.map(artist => artist.name).join(', ');
            const playedAt = new Date(item.played_at).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="recent-item">
                    <img src="${track.album.images[2]?.url || ''}" alt="${track.name}" class="item-image">
                    <div class="item-details">
                        <p class="item-name">${track.name}</p>
                        <p class="item-subtitle">${artists}</p>
                        <p class="item-time">${playedAt}</p>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="spotify-section">
                <h4>⏰ Escuchado Recientemente</h4>
                <div class="recent-list">
                    ${tracksHtml}
                </div>
            </div>
        `;
    }

    handleError(error) {
        let errorMessage = 'Error al cargar las estadísticas musicales';
        
        if (error.message.includes('503')) {
            errorMessage = 'Las estadísticas musicales no están disponibles temporalmente';
        } else if (error.message.includes('fetch')) {
            errorMessage = 'No se pudo conectar con el servidor';
        }

        if (this.statsContainer) {
            this.statsContainer.innerHTML = `
                <div class="spotify-error">
                    <h3>🎵 Estadísticas Musicales</h3>
                    <p class="error-message">${errorMessage}</p>
                    <button onclick="window.marioSpotifyStats.loadMarioStats()" class="retry-button">
                        Intentar de nuevo
                    </button>
                </div>
            `;
        }

        // Reintentar automáticamente con backoff exponencial
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const retryDelay = Math.pow(2, this.retryCount) * 1000; // 2s, 4s, 8s
            setTimeout(() => {
                console.log(`Reintentando... (${this.retryCount}/${this.maxRetries})`);
                this.loadMarioStats();
            }, retryDelay);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.marioSpotifyStats = new MarioSpotifyStats();
});
