# 🎵 Estadísticas de Spotify - Sistema de Exhibición Personal

Este sistema permite mostrar **las estadísticas musicales de Mario** en su portfolio personal, sin requerir que los visitantes se conecten con sus propias cuentas de Spotify.

## 📋 Cómo Funciona

### Para los Visitantes
- **No necesitan autenticarse**: Las estadísticas se muestran automáticamente
- **Ven los datos de Mario**: Canciones favoritas, artistas, historial de reproducción
- **Actualización automática**: Los datos se actualizan cada 5 minutos
- **Interfaz responsive**: Compatible con dispositivos móviles y escritorio

### Para Mario (Administrador)
- **Autorización única**: Solo necesitas autenticarte una vez
- **Gestión automática**: El sistema renueva automáticamente los tokens
- **Panel de administración**: Interfaz para monitorear y gestionar el sistema

## 🚀 Configuración Inicial

### 1. Configurar la Aplicación Spotify

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una nueva aplicación
3. Configura las siguientes URLs de redirección:
   - `https://wolverine307mda.github.io/callback` (para GitHub Pages)
   - `http://localhost:3000/callback` (para desarrollo local)

### 2. Configurar el Servidor

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar credenciales** en `server.js`:
   ```javascript
   const SPOTIFY_CLIENT_ID = 'tu_client_id_aquí';
   const SPOTIFY_CLIENT_SECRET = 'tu_client_secret_aquí';
   ```

3. **Iniciar el servidor**:
   ```bash
   npm start
   ```

### 3. Autorización Inicial (Solo una vez)

1. Ve a `http://localhost:3000/admin.html`
2. Haz clic en "🔐 Autorizar Spotify"
3. Autoriza la aplicación en Spotify
4. ¡Listo! El sistema ya está funcionando

## 🎯 Endpoints del Sistema

### Públicos (Para todos)
- `GET /api/mario-stats` - Obtener estadísticas de Mario
- `GET /` - Portfolio principal
- `GET /callback.html` - Manejo de autenticación

### Administración (Solo para Mario)
- `GET /admin.html` - Panel de administración
- `GET /admin/auth/spotify` - Iniciar autorización
- `GET /admin/status` - Estado del sistema
- `POST /admin/refresh-token` - Refrescar tokens manualmente

## 🎨 Personalización

### Modificar la URL del Servidor
En `js/mario-spotify-stats.js`, cambia:
```javascript
this.serverUrl = 'https://tu-servidor.com'; // URL de producción
```

### Personalizar Estilos
Los estilos están en `css/spotify.css` y son compatibles con el sistema de modo claro/oscuro del portfolio.

## 📊 Datos Mostrados

El sistema muestra:
- **Canción actual**: Lo que Mario está escuchando ahora
- **Top 5 canciones**: Favoritas de Mario (último mes)
- **Top 5 artistas**: Favoritos de Mario (último mes)
- **Últimas 3 canciones**: Historial reciente de reproducción

## 🔧 Administración

### Panel de Admin (`/admin.html`)
- **Estado de tokens**: Válidos/Inválidos
- **Expiración**: Cuándo expiran los tokens
- **Cache**: Estado de los datos almacenados
- **Acciones**: Refrescar tokens, probar API, etc.

### Mantenimiento Automático
- **Renovación de tokens**: Automática cuando expiran
- **Cache inteligente**: Datos se actualizan cada 5 minutos
- **Manejo de errores**: Reintentos automáticos

## 🌐 Despliegue

### Desarrollo Local
```bash
npm install
npm start
```

### Producción
1. Despliega el servidor Node.js en tu plataforma preferida
2. Actualiza las URLs en los archivos JavaScript
3. Configura las variables de entorno:
   ```
   SPOTIFY_CLIENT_ID=tu_client_id
   SPOTIFY_CLIENT_SECRET=tu_client_secret
   ```

### GitHub Pages
- Los archivos estáticos (`index.html`, `callback.html`, etc.) se pueden hospedar en GitHub Pages
- El servidor Node.js debe estar en un servicio separado (Heroku, Railway, etc.)

## 🔒 Seguridad

- **Tokens protegidos**: Solo el administrador puede generar tokens
- **API pública segura**: Solo expone datos de estadísticas (no tokens)
- **Expiración automática**: Los tokens se renuevan automáticamente
- **Logs de seguridad**: Monitoreo de accesos y errores

## 📝 Notas Importantes

1. **Primera autorización**: Mario debe autorizar la aplicación al menos una vez
2. **Servidor activo**: El servidor Node.js debe estar corriendo para que funcione
3. **Límites de API**: Spotify tiene límites de llamadas (el sistema los respeta)
4. **Datos privados**: Solo se muestran estadísticas públicas, no datos sensibles

## 🆘 Solución de Problemas

### "No hay tokens disponibles"
- Ve a `/admin.html` y haz clic en "Autorizar Spotify"

### "Error al conectar con el servidor"
- Verifica que el servidor Node.js esté corriendo
- Comprueba la URL del servidor en `mario-spotify-stats.js`

### "Tokens expirados"
- El sistema debería renovarlos automáticamente
- Si no funciona, ve a `/admin.html` y haz clic en "Refrescar Token"

## 🎵 ¡Disfruta mostrando tu música!

El sistema está diseñado para ser simple y efectivo: **tú te conectas una vez, y todos pueden ver tu música**. 🎶
