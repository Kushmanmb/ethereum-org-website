# API Keys & Configuration Guide

This document provides comprehensive instructions for setting up API keys and environment variables for the ethereum.org website.

> [!IMPORTANT]
> **Security Warning**: Never commit `.env` files or expose API keys in code. All secrets should be stored in environment variables.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys to the `.env` file (see detailed instructions below)

3. For local development without API keys, set `USE_MOCK_DATA=true` in your `.env` file

## Environment Variables Reference

### Development vs Production

- **NEXT_PUBLIC_*** variables are exposed to the browser - never use them for secrets
- Regular environment variables are only available server-side
- Production deployments (e.g., Netlify) need all variables configured in their dashboard

## API Configuration

### 1. GitHub API Token (Recommended for Local Development) ⭐

**Purpose**: Fetches repository data for projects and contributors without rate limiting.

**Type**: Free, Personal Access Token

**Setup**:
1. [Create a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
   - Use "Fine-grained tokens" or "Classic tokens"
   - For this project, no special scopes are required (read-only public data)
   - In step 8 of token creation, leave all scopes unchecked
2. Copy the generated token
3. Add to your `.env`:
   ```bash
   GITHUB_TOKEN_READ_ONLY=ghp_your_token_here_1234567890abcdef
   ```

**Note**: GitHub has rate limits for unauthenticated requests. Using a token significantly increases your rate limit.

---

### 2. Algolia Search (Required for Search Functionality)

**Purpose**: Powers the site search feature.

**Type**: Free tier available

**Setup Options**:

#### Option A: Use DocSearch Test Keys (Development)
For local development and testing, you can use these test keys:

```bash
NEXT_PUBLIC_ALGOLIA_APP_ID=R2IYF7ETH7
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=599cec31baffa4868cae4e79f180729b
NEXT_PUBLIC_ALGOLIA_BASE_SEARCH_INDEX_NAME=docsearch
```

#### Option B: Production Keys
For production or custom search indexes:

1. [Create an Algolia account](https://www.algolia.com/)
2. Create a new application or use an existing one
3. Navigate to API Keys section
4. Copy your Application ID and Search-Only API Key
5. Add to your `.env`:
   ```bash
   NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
   NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_only_key
   NEXT_PUBLIC_ALGOLIA_BASE_SEARCH_INDEX_NAME=your_index_name
   ```

⚠️ **Security Note**: Only use the Search-Only API Key in `NEXT_PUBLIC_*` variables, never the Admin API Key.

---

### 3. Etherscan API Key (Recommended)

**Purpose**: Fetches Ethereum blockchain data and statistics.

**Type**: Free tier available

**Setup**:
1. [Create an Etherscan account](https://etherscan.io/register)
2. Navigate to Account Settings → API-KEYs
3. Click "Add" to create a new API key
4. Copy the generated key
5. Add to your `.env`:
   ```bash
   ETHERSCAN_API_KEY=YOUR_API_KEY_HERE
   ```

**Note**: Free tier includes 5 calls/second, which is sufficient for development.

---

### 4. Google APIs (Optional)

**Purpose**: 
- Google Calendar API: Fetches community events
- Google Sheets API: Manages dApp data

**Type**: Free with Google Cloud account

**Setup**:
1. [Create a Google Cloud Project](https://console.cloud.google.com/)
2. Enable the Calendar API and Sheets API
3. Create credentials (API key)
4. Add to your `.env`:
   ```bash
   GOOGLE_API_KEY=your_api_key
   GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
   GOOGLE_SHEET_ID_DAPPS=your_sheet_id
   ```

**Note**: For local development, you can skip this and use mock data.

---

### 5. Matomo Analytics (Production Only)

**Purpose**: Privacy-friendly analytics platform.

**Type**: Requires Matomo instance

**Setup**:
1. Obtain your Matomo URL and Site ID from your Matomo administrator
2. Add to your `.env`:
   ```bash
   NEXT_PUBLIC_MATOMO_URL=https://your-matomo-instance.com/
   NEXT_PUBLIC_MATOMO_SITE_ID=1
   ```

**Preview Deploys**: Set this to prevent analytics in preview environments:
```bash
NEXT_PUBLIC_IS_PREVIEW_DEPLOY=false
```

---

### 6. AWS SES (Optional - For Contact Forms)

**Purpose**: Sends emails for enterprise contact forms.

**Type**: AWS account required

**Setup**:
1. [Create an AWS account](https://aws.amazon.com/)
2. Configure SES in your desired region
3. Create IAM user with SES permissions
4. Generate access keys
5. Add to your `.env`:
   ```bash
   SES_ACCESS_KEY_ID=your_iam_access_key_id
   SES_SECRET_ACCESS_KEY=your_iam_secret_access_key
   SES_REGION=us-east-2
   ```

⚠️ **Security Critical**: These are server-side only variables. Never expose in client code.

---

### 7. Crowdin API (For Translation Management)

**Purpose**: Manages internationalization and translation workflows.

**Type**: Crowdin account with project access

**Setup**:
1. [Log in to Crowdin](https://crowdin.com/)
2. Go to Account Settings → API
3. Generate a new Personal Access Token
4. Add to your `.env`:
   ```bash
   CROWDIN_API_KEY=your_personal_access_token
   ```

**Note**: Only needed if you're managing translations. Not required for local development.

---

### 8. Dune Analytics (Optional)

**Purpose**: Fetches blockchain statistics like total ETH staked.

**Type**: Dune account required

**Setup**:
1. [Create a Dune Analytics account](https://dune.com/)
2. Navigate to Settings → API
3. Create a new API key
4. Add to your `.env`:
   ```bash
   DUNE_API_KEY=your_api_key
   ```

---

## Additional Configuration

### Build Optimization

Control which languages to build (useful for faster local builds):

```bash
# Build only English (fastest)
NEXT_PUBLIC_BUILD_LOCALES=en

# Build English and Spanish
NEXT_PUBLIC_BUILD_LOCALES=en,es

# Build all languages (comment out or leave empty)
# NEXT_PUBLIC_BUILD_LOCALES=
```

### Resource Constraints

Limit CPU usage during builds to prevent system overload:

```bash
# Example: Limit to 2 CPUs
LIMIT_CPUS=2
```

### Bundle Analysis

Enable webpack bundle analyzer:

```bash
ANALYZE=true
```

### Mock Data Mode

Work without API keys during development:

```bash
USE_MOCK_DATA=true
```

## Security Checklist

Before committing your changes, verify:

- [ ] `.env` file is in `.gitignore` (it is by default)
- [ ] No API keys are hardcoded in source files
- [ ] Only Search-Only keys are in `NEXT_PUBLIC_*` variables
- [ ] `.env.example` doesn't contain real API keys (only placeholders)
- [ ] Sensitive keys use server-side variables (not `NEXT_PUBLIC_*`)

## Troubleshooting

### Rate Limiting Issues
- Add GitHub token to increase rate limits
- Check API key quotas in respective dashboards

### Search Not Working
- Verify Algolia keys are correct
- Check that `NEXT_PUBLIC_*` prefix is used for Algolia variables
- Try using DocSearch test keys first

### API Key Errors
- Ensure `.env` file is in the root directory
- Restart development server after changing `.env`
- Check that variables are properly formatted (no extra spaces)

### Mock Data Not Working
- Ensure `USE_MOCK_DATA=true` is set in `.env`
- Some features may still require specific APIs

## Additional Resources

- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)
- [SECURITY.md](../SECURITY.md) - Security policy and vulnerability reporting
- [GitHub .env.example](../.env.example) - Template file with all variables

---

**Last Updated**: February 2026

**Need Help?** Open an issue or ask in our [Discord community](https://discord.gg/ethereum-org).
