# Quick Start Guide for GEMINI_API_KEY Setup

This guide helps you quickly set up the Gemini API key for local development or GitHub Pages deployment.

## For Local Development (5 minutes)

### Step 1: Get Your API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Set Up Environment File
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and replace 'your_api_key_here' with your actual key
```

Your `.env.local` should look like:
```
GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl012MNO345pqr
```

### Step 3: Run the Application
```bash
npm install
npm run dev
```

That's it! Your app should now work with the Gemini API.

## For GitHub Pages Deployment (3 minutes)

### Step 1: Add Secret to GitHub
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `GEMINI_API_KEY`
5. Value: Your Gemini API key
6. Click **"Add secret"**

### Step 2: Trigger Deployment
Push to the `main` branch or manually trigger the workflow, and GitHub Actions will automatically build and deploy with your API key.

## Troubleshooting

### Local Development Issues

**Problem:** "API key not found" error
- **Solution:** Make sure `.env.local` exists in the project root
- **Solution:** Verify the file contains `GEMINI_API_KEY=your_actual_key`
- **Solution:** Restart the dev server after creating/editing `.env.local`

**Problem:** Build fails with undefined API_KEY
- **Solution:** Ensure you have the `.env.local` file with the correct variable name
- **Solution:** Try `GEMINI_API_KEY=your_key npm run build` as a workaround

### GitHub Pages Deployment Issues

**Problem:** Deployed app shows API errors
- **Solution:** Verify the `GEMINI_API_KEY` secret is set in GitHub repository settings
- **Solution:** Check the Actions workflow logs for build errors
- **Solution:** Retrigger the deployment after adding the secret

**Problem:** API key exposed in JavaScript
- **This is expected behavior** for client-side apps
- For production, consider implementing a backend API proxy (see SECURITY.md)

## Security Reminders

✅ **DO:**
- Keep your `.env.local` file private
- Use GitHub Secrets for deployment
- Monitor your API usage regularly
- Rotate keys if exposed

❌ **DON'T:**
- Commit `.env.local` or `.env` files to Git
- Share your API key in chat, email, or screenshots
- Use the same key across multiple public projects
- Ignore suspicious API usage

## Need More Help?

- 📚 Full documentation: See [README.md](README.md)
- 🔒 Security guidance: See [SECURITY.md](SECURITY.md)
- 🌐 Google AI Studio: [https://aistudio.google.com](https://aistudio.google.com)
- 🔑 Manage API Keys: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
