#!/usr/bin/env node
// Script de prueba para verificar el servidor

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:3000';

async function testServer() {
    console.log('🧪 Probando servidor...\n');
    
    try {
        // Probar archivo index.html
        console.log('1. Probando página principal (/)...');
        try {
            const indexResponse = await axios.get(`${SERVER_URL}/`);
            console.log('✅ Página principal cargada correctamente');
        } catch (error) {
            console.log('❌ Error en página principal:', error.message);
        }

        // Probar archivos estáticos
        console.log('\n2. Probando archivos estáticos...');
        const staticFiles = [
            '/css/style.css',
            '/js/mario-spotify-stats.js',
            '/admin.html'
        ];

        for (const file of staticFiles) {
            try {
                await axios.get(`${SERVER_URL}${file}`);
                console.log(`✅ ${file} - OK`);
            } catch (error) {
                console.log(`❌ ${file} - Error: ${error.message}`);
            }
        }
        
        // Probar endpoint de estado
        console.log('\n3. Probando /admin/status...');
        try {
            const statusResponse = await axios.get(`${SERVER_URL}/admin/status`);
            console.log('✅ Estado:', statusResponse.data);
        } catch (error) {
            console.log('❌ Error en estado:', error.message);
        }
        
        // Probar endpoint de estadísticas (debería dar error sin tokens)
        console.log('\n4. Probando /api/mario-stats...');
        try {
            const statsResponse = await axios.get(`${SERVER_URL}/api/mario-stats`);
            console.log('✅ Estadísticas:', statsResponse.data);
        } catch (error) {
            if (error.response && error.response.status === 503) {
                console.log('⚠️ Sin tokens (esperado):', error.response.data);
            } else {
                console.log('❌ Error inesperado:', error.message);
            }
        }

        // Verificar archivos locales
        console.log('\n5. Verificando archivos locales...');
        const localFiles = [
            'index.html',
            'admin.html',
            'server.js',
            'package.json'
        ];

        for (const file of localFiles) {
            if (fs.existsSync(path.join(__dirname, file))) {
                console.log(`✅ ${file} existe`);
            } else {
                console.log(`❌ ${file} NO existe`);
            }
        }
        
        console.log('\n✅ Pruebas completadas!');
        console.log(`🌐 Portfolio: ${SERVER_URL}/`);
        console.log(`📊 Panel de admin: ${SERVER_URL}/admin.html`);
        console.log(`🔐 Autorizar Spotify: ${SERVER_URL}/admin/auth/spotify`);
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Asegúrate de que el servidor esté corriendo: npm start');
        }
    }
}

testServer();
