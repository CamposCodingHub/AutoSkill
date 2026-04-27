import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'icon-144x144.svg', 'icon-192x192.svg', 'icon-512x512.svg'],
            manifest: {
                name: 'AutoSkill - Curso de Eletricista Automotivo',
                short_name: 'AutoSkill',
                description: 'Plataforma de aprendizado de eletricidade automotiva',
                theme_color: '#FF6A00',
                background_color: '#080808',
                display: 'standalone',
                icons: [
                    {
                        src: '/icon-144x144.svg',
                        sizes: '144x144',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: '/icon-192x192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: '/icon-512x512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,svg,json}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https?.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 24 * 60 * 60
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:json)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'lessons-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 7 * 24 * 60 * 60
                            }
                        }
                    }
                ]
            }
        })
    ],
})