# CI/CD Setup

This repository now includes a single GitHub Actions pipeline at `.github/workflows/ci-cd.yml`.

## What it does

- Runs backend tests on pull requests and pushes to `main`
- Runs frontend lint and production build on pull requests and pushes to `main`
- Builds and publishes Docker images to GitHub Container Registry on pushes to `main`
- Triggers production deploy webhooks after a successful image publish

## Published images

- `ghcr.io/<owner>/myshow-backend:latest`
- `ghcr.io/<owner>/myshow-frontend:latest`
- `ghcr.io/<owner>/myshow-backend:<git-sha>`
- `ghcr.io/<owner>/myshow-frontend:<git-sha>`

## GitHub Variables

Add these repository or environment variables if you want the frontend image to be built with production values:

- `VITE_BASE_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_TMDB_IMAGE_BASE_URL`
- `VITE_CURRENCY`

If they are missing, the workflow falls back to safe defaults so CI still runs.

## GitHub Secrets

Add these if you want automatic production deploys after a successful push to `main`:

- `BACKEND_DEPLOY_WEBHOOK_URL`
- `FRONTEND_DEPLOY_WEBHOOK_URL`

These can point to deploy hooks from platforms like Vercel, Render, Railway, Netlify, Fly.io, or your own deployment service.

## Recommended GitHub Settings

- Protect the `main` branch
- Require the `Backend CI` and `Frontend CI` checks before merge
- Configure the `production` environment with required reviewers if you want a manual approval gate before deploy
- Keep GHCR packages private unless you intentionally want public images

## Notes

- The deploy job only runs on `push` to `main`
- The deploy job is skipped automatically when no deploy webhook secrets are configured
- The workflow is path-aware, so backend-only changes do not run frontend CI and vice versa
