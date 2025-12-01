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

This repository includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

### Setup Instructions

1. **Enable GitHub Pages:**
   - Go to your repository's **Settings** > **Pages**
   - Under "Build and deployment", select **GitHub Actions** as the source

2. **Add your Gemini API Key (if using AI features):**
   - Go to your repository's **Settings** > **Secrets and variables** > **Actions**
   - Click **New repository secret**
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key

3. **Deploy:**
   - Push to the `main` branch to trigger automatic deployment
   - Or manually trigger the workflow from **Actions** > **Deploy to GitHub Pages** > **Run workflow**

4. **Access your app:**
   - After successful deployment, your app will be available at:
   - `https://<your-username>.github.io/ResumeBuilder_TPF_V1/`
