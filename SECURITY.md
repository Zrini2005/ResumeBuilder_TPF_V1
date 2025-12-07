# Security Policy

## API Key Security

### Overview

This application uses the Google Gemini API to provide AI-powered features. The API requires an API key for authentication.

### Security Considerations

**⚠️ Important:** This is a client-side React application deployed to GitHub Pages. Any API keys embedded in the application will be visible to end users.

### Best Practices

#### For Development

1. **Never commit API keys to version control**
   - Always use `.env.local` for local development
   - The `.env.local` file is automatically excluded via `.gitignore`
   - Never rename it to `.env` without the `.local` suffix

2. **Use the provided template**
   - Copy `.env.local.example` to `.env.local`
   - Add your API key to `.env.local`
   - Never commit `.env.local` to Git

3. **Rotate your API keys regularly**
   - If you accidentally commit an API key, revoke it immediately
   - Generate a new key from [Google AI Studio](https://aistudio.google.com/app/apikey)

#### For GitHub Pages Deployment

1. **Use GitHub Secrets**
   - Store your `GEMINI_API_KEY` in GitHub repository secrets
   - Access it via GitHub Actions environment variables
   - See README.md for setup instructions

2. **Understand the limitations**
   - API keys in client-side code can be extracted from JavaScript bundles
   - Users can view network requests and see the API key in use
   - Consider implementing usage limits on your API key

3. **Monitor your API usage**
   - Regularly check your Google Cloud Console for unexpected usage
   - Set up billing alerts to avoid unexpected charges
   - Consider implementing rate limiting on your API key

### Recommended Production Setup

For a production application with sensitive API keys:

1. **Build a backend API proxy**
   - Create a server-side application (Node.js, Python, etc.)
   - Store the API key securely on the server
   - Have your React app call your backend, which then calls Gemini API
   - This keeps your API key secure and never exposed to clients

2. **Implement authentication**
   - Add user authentication to your backend
   - Rate limit API requests per user
   - Monitor and log API usage

3. **Use environment-specific keys**
   - Development key for local testing
   - Separate production key with stricter limits
   - Separate keys for different environments

### What to Do If Your Key is Exposed

If you accidentally commit or expose your API key:

1. **Immediately revoke the key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Delete the compromised API key

2. **Generate a new key**
   - Create a new API key
   - Update your `.env.local` file
   - Update GitHub repository secrets if needed

3. **Review API usage**
   - Check for any unauthorized usage
   - Review your billing if applicable

4. **Update Git history (if committed)**
   - Use `git filter-branch` or BFG Repo-Cleaner to remove the key from history
   - Force push to remote (note: this affects all collaborators)
   - Consider creating a new repository if necessary

### Reporting Security Issues

If you discover a security issue in this application, please report it by creating a private security advisory on GitHub or contacting the repository maintainer directly.

## Additional Resources

- [Google AI Studio API Key Management](https://aistudio.google.com/app/apikey)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
