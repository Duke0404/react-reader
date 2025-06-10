import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
	plugins: [
		react(),
		TanStackRouterVite(),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: {
				enabled: true // Enable PWA in development
			},
			workbox: {
				// Cache all static assets during build
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,ttf,woff}"],

				// Don't cache node_modules except specific ones we need
				globIgnores: ["**/node_modules/**/*"],

				// Handle client-side routing
				navigateFallback: "/",
				navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],

				// Runtime caching strategies
				runtimeCaching: [
					// Cache static assets with CacheFirst strategy
					{
						urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|css|js|html|woff2|ttf|woff)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "static-assets",
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					},

					// Cache PDF.js worker files
					{
						urlPattern: /^https:\/\/unpkg\.com\/pdfjs-dist\/.*$/,
						handler: "CacheFirst",
						options: {
							cacheName: "pdf-worker-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					},

					// Cache any external CDN assets
					{
						urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*$/,
						handler: "CacheFirst",
						options: {
							cacheName: "cdn-cache",
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					}
				]
			},
			manifest: {
				name: "React Reader App",
				short_name: "Reader",
				description: "Offline-capable React PDF Reader",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				display: "standalone",
				start_url: "/",
				scope: "/",
				icons: [
					{
						src: "icons/icon-192x192.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "icons/icon-512x512.png",
						sizes: "512x512",
						type: "image/png"
					}
				]
			}
		})
	]
})
