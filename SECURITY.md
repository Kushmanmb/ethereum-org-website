# Security Policy

## Overview

The security of ethereum.org is a top priority. This document outlines our security practices, supported versions, and how to report vulnerabilities.

## Supported Versions

Generally, only the latest version of this website is in production. The primary security risks are:

- Potential for users to be directed to scams or malicious content
- Exposure of API keys or sensitive configuration
- Cross-site scripting (XSS) vulnerabilities
- Phishing attempts through compromised content

We continuously monitor and update the production site to address security concerns.

## Reporting a Vulnerability

**🚨 Please do not report security vulnerabilities through public GitHub issues.**

### Preferred Method: Email

For critical vulnerabilities, please report via email:

- **Email**: security@ethereum.org
- **PGP Key**: Available at https://ethereum.org/.well-known/security.txt
- **Expected Response Time**: Within 24-48 hours

### What to Include

When reporting a vulnerability, please provide:

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential impact and severity assessment
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Proof of Concept**: If available, include PoC code or screenshots
5. **Suggested Fix**: If you have recommendations for fixing the issue
6. **Your Contact**: How we can reach you for follow-up questions

### What to Expect

1. **Acknowledgment**: We'll acknowledge receipt within 48 hours
2. **Investigation**: Our security team will investigate the report
3. **Updates**: We'll keep you informed of our progress
4. **Resolution**: Once verified and fixed, we'll notify you
5. **Credit**: With your permission, we'll credit you for the discovery

## Security Best Practices for Contributors

### Environment Variables & API Keys

- **Never commit `.env` files** - They contain secrets and are in `.gitignore`
- **Never hardcode API keys** - Always use environment variables
- **Use `NEXT_PUBLIC_*` carefully** - These variables are exposed to browsers
- **Rotate keys if exposed** - If you accidentally commit a key, rotate it immediately

See [docs/api-keys.md](docs/api-keys.md) for detailed configuration guidance.

### Code Security

- **Validate user input** - Always sanitize and validate external data
- **Use parameterized queries** - Prevent injection attacks
- **Keep dependencies updated** - Regularly update npm packages
- **Review external links** - Verify links before adding them to content
- **Sanitize markdown/HTML** - Be cautious with user-generated content

### Content Security

- **Verify external resources** - Check legitimacy of projects/links before adding
- **Watch for phishing** - Be alert to scam attempts in PRs or issues
- **Review wallet addresses** - Double-check any wallet addresses in content
- **Check for social engineering** - Be cautious of suspicious requests

## Security Features

### Implemented Protections

- **Content Security Policy (CSP)**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking (set to DENY)
- **HTTPS Only**: All traffic uses secure connections
- **Environment Isolation**: Separate configs for dev/preview/production
- **Dependency Scanning**: Automated checks for vulnerable packages
- **Secret Detection**: Git hooks prevent accidental key commits

### Authentication & Authorization

- **GitHub OAuth**: For contributor features
- **No User Authentication**: Public site requires no login
- **Admin Access**: Limited to verified maintainers
- **API Rate Limiting**: Protection against abuse

## Incident Response

In case of a security incident:

1. **Immediate Response**: Critical issues are addressed within hours
2. **Communication**: Affected parties notified promptly
3. **Remediation**: Fix deployed as quickly as possible
4. **Post-Mortem**: Review to prevent future incidents
5. **Disclosure**: Responsible disclosure after fix is live

## Bug Bounty Program

For Ethereum protocol security issues (not ethereum.org website), see:
- [Ethereum Bug Bounty Program](https://ethereum.org/en/bug-bounty/)
- Consensus layer bug bounty details in `/src/data/consensus-bounty-hunters.json`

For ethereum.org website vulnerabilities, please follow the reporting process above.

## Security Contacts

- **Website Security**: security@ethereum.org
- **General Inquiries**: website@ethereum.org
- **Discord**: [ethereum.org Discord](https://discord.gg/ethereum-org) (for non-sensitive questions)

## Scope

### In Scope

- ethereum.org website and web application
- API endpoints and integrations
- Build and deployment processes
- Content management vulnerabilities
- XSS, CSRF, injection vulnerabilities
- Authentication/authorization issues
- Information disclosure
- Configuration issues leading to security risks

### Out of Scope

- Ethereum protocol vulnerabilities (use Bug Bounty Program instead)
- Third-party service vulnerabilities (report to those services)
- Social engineering attacks against maintainers
- DDoS attacks (we have infrastructure protections)
- Issues in archived/deprecated content
- Previously known issues

## Responsible Disclosure

We follow a responsible disclosure policy:

1. **Private Reporting**: Vulnerabilities reported privately
2. **Coordinated Fix**: Fix developed and tested before disclosure
3. **Public Disclosure**: After fix is deployed (typically 30-90 days)
4. **Credit Given**: Reporter credited (if desired)

We ask that reporters:
- Give us reasonable time to address issues before public disclosure
- Avoid privacy violations, data destruction, or service interruption
- Don't exploit vulnerabilities beyond minimal testing

## Additional Resources

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [API Keys Documentation](docs/api-keys.md)
- [Ownership & Governance](docs/ownership.md)

---

**Last Updated**: February 2026

**Security Team**: Core maintainers (see [docs/ownership.md](docs/ownership.md#specialized-maintainers))
