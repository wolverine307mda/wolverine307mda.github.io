# 🎵 Integración con Spotify - Guía de Configuración

Esta guía te ayudará a configurar la integración con Spotify para mostrar tus estadísticas musicales reales en tiempo real.

## 📋 Requisitos previos

- Node.js (versión 14 o superior)
- Una cuenta de Spotify
- Una aplicación registrada en Spotify Developer Dashboard

## 🚀 Configuración paso a paso

### 1. Crear aplicación en Spotify Developer Dashboard

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Inicia sesión con tu cuenta de Spotify
3. Haz clic en "Create an App"
4. Completa los campos:
   - **App name**: "Mi Portfolio Web"
   - **App description**: "Integración de Spotify para mostrar estadísticas musicales"
   - **Website**: Tu dominio (ej: https://tudominio.com)
   - **Redirect URI**: `http://localhost:3000/callback`
5. Acepta los términos y haz clic en "Create"
6. Copia tu **Client ID** y **Client Secret**

### 2. Configurar credenciales

1. Abre el archivo `server.js`
2. Reemplaza estas líneas con tus credenciales reales:

```javascript
const SPOTIFY_CLIENT_ID = 'TU_CLIENT_ID_AQUI';
const SPOTIFY_CLIENT_SECRET = 'TU_CLIENT_SECRET_AQUI';
```

⚠️ **IMPORTANTE**: Nunca expongas tu Client Secret en el frontend. Siempre debe estar en el servidor.

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar el servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### 5. Probar la integración

1. Abre tu navegador y ve a `http://localhost:3000`
2. Navega a la sección "Mis Aficiones"
3. Haz clic en "Conectar con Spotify"
4. Autoriza la aplicación en Spotify
5. ¡Disfruta de tus estadísticas reales!

## 🔧 Personalización

### Cambiar período de tiempo

En `spotify-stats.js`, puedes cambiar el período de tiempo para las estadísticas:

```javascript
// Opciones: 'short_term' (4 semanas), 'medium_term' (6 meses), 'long_term' (varios años)
const topArtists = await spotifyAPI.getTopArtists('medium_term', 4);
```

### Ajustar frecuencia de actualización

```javascript
// Actualizar canción actual cada 30 segundos
this.updateInterval = setInterval(async () => {
    // ...
}, 30000); // Cambiar este valor (en milisegundos)
```

### Personalizar número de artistas mostrados

```javascript
// Mostrar más o menos artistas
const topArtists = await spotifyAPI.getTopArtists('medium_term', 6); // Cambiar el número
```

## 📊 Datos que se muestran

- **Artistas más escuchados**: Tus top 4 artistas con imágenes y géneros
- **Canción actual**: La canción que estás escuchando ahora (si hay alguna)
- **Estadísticas en tiempo real**: Datos actualizados automáticamente
- **Enlaces a Spotify**: Acceso directo a los artistas en Spotify

## 🔒 Seguridad

- ✅ Client Secret nunca expuesto en el frontend
- ✅ Tokens almacenados localmente de forma segura
- ✅ Refresh automático de tokens
- ✅ Manejo de errores y expiración

## 🌐 Despliegue en producción

Para desplegar en producción:

1. **Actualizar redirect URI** en Spotify Developer Dashboard
2. **Configurar variables de entorno**:
   ```bash
   export SPOTIFY_CLIENT_ID="tu_client_id"
   export SPOTIFY_CLIENT_SECRET="tu_client_secret"
   export PORT=3000
   ```
3. **Actualizar servidor URL** en `spotify.js`:
   ```javascript
   const SPOTIFY_CONFIG = {
       serverUrl: 'https://tu-dominio.com', // Tu dominio de producción
       // ...
   };
   ```

## 🔥 Características avanzadas

### Modo offline
Si no hay conexión a Internet, se mantendrán los datos previamente cargados.

### Actualizaciones en tiempo real
- Canción actual: cada 30 segundos
- Estadísticas completas: cada 5 minutos

### Responsive design
La interfaz se adapta perfectamente a dispositivos móviles.

## 🐛 Solución de problemas

### Error: "Token inválido o expirado"
- Reconéctate con Spotify haciendo clic en "Conectar con Spotify"

### Error: "No se pueden cargar las estadísticas"
- Verifica que el servidor esté ejecutándose
- Comprueba las credenciales en `server.js`

### La canción actual no se actualiza
- Asegúrate de que estés reproduciendo música en Spotify
- Verifica que hayas dado permisos de lectura de reproducción

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles (iOS, Android)
- ✅ Modo oscuro/claro
- ✅ Responsive design

## 🎨 Personalización visual

Los estilos están en `css/spotify.css` y puedes personalizarlos:

```css
/* Cambiar colores de Spotify */
.btn-spotify {
    background: linear-gradient(45deg, #1db954, #1ed760);
}

/* Personalizar indicador de reproducción */
.playing-indicator span {
    background: #ff6b6b; /* Cambiar color */
}
```

¡Ahora tu portfolio mostrará tus verdaderos gustos musicales en tiempo real! 🎶
