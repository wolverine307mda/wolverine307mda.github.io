# 🎵 Configuración Final - Spotify OAuth

## ✅ Credenciales configuradas
- **Client ID**: 94e0c3686a28482d80a93b4adcd10ce6
- **Client Secret**: d1e2041846154896a69d52b946d0e22b (configurado en el servidor)

# 🎵 Configuración Final - Spotify OAuth

## ✅ Credenciales configuradas
- **Client ID**: 94e0c3686a28482d80a93b4adcd10ce6
- **Client Secret**: d1e2041846154896a69d52b946d0e22b (configurado en el servidor)

## 🔧 Próximos pasos OBLIGATORIOS:

### 1. Configurar Redirect URI en Spotify Developer Dashboard

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications/94e0c3686a28482d80a93b4adcd10ce6)
2. Haz clic en "Settings" en tu aplicación
3. En "Redirect URIs", añade exactamente esta URL:
   ```
   https://wolverine307mda.github.io/callback.html
   ```
   ⚠️ **IMPORTANTE**: Debe ser HTTPS, no HTTP (Spotify ya no permite HTTP)
4. Haz clic en "Save"

### 2. Subir archivos a GitHub Pages

Necesitas subir estos archivos nuevos a tu repositorio de GitHub:
- `callback.html` (ya creado)
- `server.js` (actualizado)
- Todos los archivos JS de Spotify

```bash
git add .
git commit -m "Añadir integración con Spotify"
git push origin main
```

### 3. Instalar dependencias y ejecutar servidor local

```bash
# Instalar dependencias de Node.js
npm install

# Ejecutar el servidor en modo desarrollo
npm run dev
```

El servidor local se ejecutará en: `http://localhost:3000`

### 4. Probar la integración

1. Asegúrate de que tu GitHub Pages esté activo en `https://wolverine307mda.github.io`
2. Asegúrate de que el servidor local esté ejecutándose (`npm run dev`)
3. Ve a tu portfolio en GitHub Pages
4. Navega a la sección "Mis Aficiones" → "🎵 Música"
5. Haz clic en "Conectar con Spotify"
6. Autoriza la aplicación (te redirigirá a callback.html)
7. ¡Disfruta de tus estadísticas reales!

## 🎯 Lo que verás después de conectar:

- ✅ **Tus artistas más escuchados** con imágenes reales
- ✅ **Canción actual** que estés reproduciendo (si hay alguna)
- ✅ **Estadísticas en tiempo real** que se actualizan automáticamente
- ✅ **Enlaces directos** a Spotify para cada artista

## 🔄 Actualizaciones automáticas:

- **Canción actual**: cada 30 segundos
- **Estadísticas completas**: cada 5 minutos
- **Datos en tiempo real**: sin necesidad de recargar la página

## ⚠️ Importante:

- **NO compartas tu Client Secret** con nadie
- El servidor debe estar ejecutándose para que funcione la autenticación
- La primera vez necesitarás autorizar la aplicación en Spotify

## 🎉 ¡Ya está todo listo!

Una vez que hayas configurado la Redirect URI en Spotify, tu integración estará completamente funcional y mostrará tus verdaderos gustos musicales en tiempo real.
