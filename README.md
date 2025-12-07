<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app hmm

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/195pPzs0m90l92QPOmXs-7MDmILZLpBdH

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This repository is configured to automatically deploy to GitHub Pages.

### Automatic Deployment

The app automatically deploys to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions.

**Live URL:** `https://zrini2005.github.io/ResumeBuilder_TPF_V1/`

### Manual Deployment

You can also deploy manually using:
```bash
npm run build
npm run deploy
```

### Configuration

- The base path is set to `/ResumeBuilder_TPF_V1/` in `vite.config.ts`
- GitHub Actions workflow is configured in `.github/workflows/deploy.yml`
- GitHub Pages must be enabled in repository settings with source set to "GitHub Actions"

