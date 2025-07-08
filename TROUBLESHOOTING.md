# 🔧 Troubleshooting Spotify Integration

## 🚨 Common Issues and Solutions

### 1. **Bad Request (400) Error**

**Error seen:**
```
GET https://accounts.spotify.com/authorize?... 400 (Bad Request)
```

**Cause:** The redirect URI in your Spotify app settings doesn't match the one being used.

**Solution:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Open your app
3. Go to "Edit Settings"
4. Add this **exact** URI to "Redirect URIs":
   ```
   http://localhost:3000/callback.html
   ```
5. Save changes
6. Restart your server

### 2. **CSP (Content Security Policy) Errors**

**Error seen:**
```
Refused to execute inline script because it violates the following Content Security Policy directive
```

**Cause:** Spotify's authorization page has strict CSP rules.

**Solution:** ✅ Already fixed in the latest server.js update
- CSP headers are now bypassed for authentication redirects
- Added Spotify domains to allowed sources

### 3. **Client ID/Secret Issues**

**Current Configuration:**
- **Client ID:** `94e0c3686a28482d80a93b4adcd10ce6`
- **Client Secret:** `d1e2041846154896a69d52b946d0e22b`

**Verify in Spotify Dashboard:**
1. Client ID matches exactly
2. Client Secret matches exactly  
3. App is not in Development Mode restrictions

### 4. **Server Not Starting**

**Symptoms:**
- Port 3000 not responding
- npm start fails

**Solutions:**
1. **Check Node.js installation:**
   ```cmd
   node --version
   npm --version
   ```

2. **Install dependencies:**
   ```cmd
   npm install
   ```

3. **Check port availability:**
   ```cmd
   netstat -an | findstr 3000
   ```

4. **Use alternative startup:**
   ```cmd
   node server.js
   ```

### 5. **PowerShell Execution Policy**

**Error seen:**
```
execution of scripts is disabled on this system
```

**Solutions:**
1. **Use Command Prompt instead:**
   ```cmd
   cd "c:\Users\wolve\Desktop\wolverine307mda.github.io"
   npm start
   ```

2. **Or temporarily allow scripts:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## 🔍 Debug Tools

### 1. **Debug Page**
Visit: `http://localhost:3000/debug`
- Shows current configuration
- Tests authorization URL
- Verifies server status

### 2. **Admin Status**
Visit: `http://localhost:3000/admin/status`
- Shows token status
- Server health check

### 3. **Test Server**
```cmd
node test-server.js
```

## 📋 Step-by-Step Testing

1. **Start Server:**
   ```cmd
   npm start
   ```

2. **Verify Server:**
   - Visit: `http://localhost:3000/`
   - Should show portfolio

3. **Check Debug Page:**
   - Visit: `http://localhost:3000/debug`
   - Verify configuration

4. **Test Authorization:**
   - Visit: `http://localhost:3000/admin.html`
   - Click "Autorizar con Spotify"
   - Should redirect to Spotify login

5. **Complete Authorization:**
   - Login with Mario's Spotify account
   - Should redirect back to callback page
   - Should show "✅ ¡Autorización exitosa!"

6. **Verify Stats:**
   - Visit: `http://localhost:3000/`
   - Music section should show real stats

## 🎯 Final Checklist

- [ ] Node.js installed and working
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors
- [ ] Port 3000 is available
- [ ] Spotify app configured correctly
- [ ] Client ID/Secret match
- [ ] Redirect URI is exactly: `http://localhost:3000/callback.html`
- [ ] Authorization completes successfully
- [ ] Stats appear on portfolio

## 🆘 Still Having Issues?

1. **Check server logs** for specific error messages
2. **Use browser developer tools** to see network requests
3. **Verify all URLs** are accessible
4. **Test with debug page** first
5. **Check Spotify app settings** again

The integration should work perfectly once these steps are completed!
