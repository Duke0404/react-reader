import { defineConfig } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { VitePWA } from "vite-plugin-pwa"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
	plugins: [
		react(),
		TanStackRouterVite(),
		VitePWA({
			registerType: "autoUpdate",
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif|webp|css|js|html)$/,
						handler: "CacheFirst",
						options: {
							cacheName: "static-assets"
						}
					},
					{
						urlPattern: /^https:\/\/api\.example\.com\/.*$/,
						handler: "NetworkFirst",
						options: {
							cacheName: "api-cache",
							networkTimeoutSeconds: 10
						}
					}
				]
			},
			manifest: {
				name: "My Vite App",
				short_name: "ViteApp",
				description: "My awesome Vite PWA!",
				theme_color: "#ffffff",
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
