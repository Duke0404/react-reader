import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import { viteStaticCopy } from "vite-plugin-static-copy"

import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
	plugins: [
		react(),
		TanStackRouterVite(),
		viteStaticCopy({
			targets: [
				{
					src: "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
					dest: "",
					rename: "pdf.worker.mjs"
				}
			]
		}),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: {
				enabled: true // Enable PWA in development
			},
			workbox: {
				// Cache all static assets during build, including the PDF worker
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,ttf,woff,mjs}"],

				// Don't cache node_modules except specific ones we need
				globIgnores: ["**/node_modules/**/*"],

				// Handle client-side routing
				navigateFallback: "/",
				navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],

				// Set cache limit to 3mb
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB

				// Runtime caching strategies
				runtimeCaching: [
					// Cache static assets with CacheFirst strategy
					{
						urlPattern:
							/\.(?:png|jpg|jpeg|svg|gif|webp|css|js|html|woff2|ttf|woff|mjs)$/,
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
					urlPattern: /\/pdf\.worker\.mjs$/,
					handler: "CacheFirst",
					options: {
						cacheName: "pdf-worker-cache",
						expiration: {
							maxEntries: 10,
							maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
						}
					}
				},

									// Cache PDF.js worker from unpkg CDN
				{
					urlPattern: /^https:\/\/unpkg\.com\/pdfjs-dist@.*\/build\/pdf\.worker\.min\.mjs$/,
					handler: "CacheFirst",
					options: {
						cacheName: "pdfjs-worker-cdn",
						expiration: {
							maxEntries: 10,
							maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
						}
					}
				},

				// Cache any other external CDN assets
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
	],
	// Ensure .mjs files are served with correct MIME type
	preview: {
		headers: {
			'Content-Type': 'application/javascript'
		}
	}
})
