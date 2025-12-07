<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app hmm

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/195pPzs0m90l92QPOmXs-7MDmILZLpBdH

## Important Security Note

**⚠️ API Key Security Warning:**

This application uses the Gemini API, which requires an API key. Since this is a client-side application, any API key embedded in the code will be visible to users. This means:

1. **Never commit your actual API key to the repository**
2. **API keys in client-side code can be extracted by anyone**
3. **Anyone with your API key can use your Gemini API quota**

### Recommended Approaches:

#### For Personal Use (Local Development):
- Use a `.env.local` file (see instructions below)
- Keep your API key private and never commit it to Git

#### For Production Deployment:
- **Option 1 (Most Secure):** Build a backend API that handles Gemini requests with your API key server-side
- **Option 2 (Current Setup):** Use GitHub Secrets for deployment (see below), but be aware users can still extract the key from the built JavaScript
- **Option 3:** Ask users to provide their own API keys through the application UI (not currently implemented)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

3. Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. Edit `.env.local` and replace `your_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. Run the app:
   ```bash
   npm run dev
   ```

**Security Reminder:** The `.env.local` file is excluded from Git via `.gitignore`. Never rename it to `.env` or commit it to the repository.

## Deploy to GitHub Pages

This repository is configured to automatically deploy to GitHub Pages.

### Automatic Deployment

The app automatically deploys to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions.

**Live URL:** `https://zrini2005.github.io/ResumeBuilder_TPF_V1/`

### Setting Up GitHub Secrets for Deployment

To enable the Gemini API functionality in the deployed version:

1. Go to your GitHub repository settings
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add a secret with:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

⚠️ **Security Warning:** Even with GitHub Secrets, the API key will be embedded in the built JavaScript files and can be extracted by users. For production applications with sensitive API keys, consider implementing a backend proxy server.

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

## File Structure

- `.env.local.example` - Template for environment variables
- `.env.local` - Your local environment variables (not tracked by Git)
- `.gitignore` - Ensures `.env` files are never committed

