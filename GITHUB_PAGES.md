# GitHub Pages Deployment

This version is preconfigured for **GitHub Project Pages**.

The deployment layout is:

```text
https://<username>.github.io/<repository>/
  -> Astro landing page

https://<username>.github.io/<repository>/app/#/
  -> React application
```

The repository name is detected automatically by GitHub Actions, so you do **not** need to hardcode your GitHub username or repository name.

## Deploy

1. Push this repository to GitHub and make sure the default branch is `main`.
2. Open **Repository -> Settings -> Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab.
5. Run or wait for **Deploy Profejoo to GitHub Pages**.
6. When the workflow succeeds, GitHub shows the public Pages URL in the deploy job and in **Settings -> Pages**.

Every later push to `main` redeploys the site automatically.

## Why the React app uses hash URLs

GitHub Pages does not provide an nginx-style SPA fallback. The public app therefore uses React Router's `createHashRouter`:

```text
/app/#/login
/app/#/dashboard
/app/#/dashboard/search
```

This prevents 404 errors when a user refreshes a nested route.

## Local development is unchanged

React:

```bash
cd app
npm install --legacy-peer-deps
npm run dev
```

Landing:

```bash
cd landing
npm install
npm run dev
```

Docker continues to use `/` as the base path because the GitHub Pages base is enabled only inside GitHub Actions.
