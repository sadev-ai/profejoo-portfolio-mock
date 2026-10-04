// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true" && Boolean(repoName);

export default defineConfig({
  output: "static",
  base: isGitHubPagesBuild ? `/${repoName}` : "/",
  server: {
    port: 4321,
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
