import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1]
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true" && Boolean(repoName)

export default defineConfig({
  base: isGitHubPagesBuild ? `/${repoName}/app/` : "/",
  server: {
    port: 5173,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
