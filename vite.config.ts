import { defineConfig } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
	plugins: [react(), TanStackRouterVite()]
})
