<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

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

This app is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
1. Build the application
2. Deploy it to GitHub Pages

### Manual Deployment

To manually deploy using gh-pages:
1. Build the app: `npm run build`
2. Deploy: `npm run deploy`

### GitHub Pages Setup

To enable GitHub Pages for this repository:
1. Go to your repository's Settings
2. Navigate to Pages section
3. Under "Build and deployment", set Source to "GitHub Actions"
4. The app will be available at: `https://zrini2005.github.io/ResumeBuilder_TPF_V1/`
