# Self-Hosted Runners Setup and Management

## Overview

This guide covers the setup, configuration, and management of self-hosted GitHub Actions runners for the ethereum.org repository. Self-hosted runners provide greater control over the execution environment and can offer performance benefits for specific workloads.

## Why Self-Hosted Runners?

### Benefits

- **Performance**: Faster builds with dedicated resources
- **Cost Control**: Reduced CI/CD costs for high-volume workflows
- **Custom Environment**: Pre-installed tools and dependencies
- **Security**: Run builds in isolated, controlled environments
- **Compliance**: Meet specific security or regulatory requirements

### When to Use

Use self-hosted runners for:
- Long-running build processes
- Memory-intensive tasks (image optimization, large builds)
- Workflows requiring specific hardware
- High-frequency CI jobs

Continue using GitHub-hosted runners for:
- Security-sensitive workflows (secrets handling)
- Workflows requiring clean environments
- Low-frequency jobs

## Prerequisites

### System Requirements

**Minimum Specifications:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 50 GB SSD
- OS: Ubuntu 22.04 LTS (recommended)

**Recommended Specifications:**
- CPU: 8+ cores
- RAM: 16+ GB
- Storage: 100+ GB NVMe SSD
- OS: Ubuntu 22.04 LTS

### Software Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
  curl \
  git \
  jq \
  build-essential \
  libssl-dev

# Install Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install pnpm
corepack enable
corepack prepare pnpm@latest --activate
```

## Installation

### 1. Create Runner in GitHub

**Repository Settings → Actions → Runners → New self-hosted runner**

1. Navigate to: `https://github.com/[org]/ethereum-org-website/settings/actions/runners/new`
2. Select **Linux** as the operating system
3. Copy the provided download and configuration commands

### 2. Download and Extract Runner

```bash
# Create directory for runner
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download latest runner package
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

### 3. Configure Runner

```bash
# Run configuration script
./config.sh --url https://github.com/[org]/ethereum-org-website \
  --token [REGISTRATION_TOKEN] \
  --name ethereum-org-runner-1 \
  --labels ethereum-org,nodejs,pnpm \
  --work _work

# Verify configuration
cat .runner
```

### 4. Install as Service (Recommended)

```bash
# Install service
sudo ./svc.sh install

# Start service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status

# Enable auto-start on boot
sudo systemctl enable actions.runner.[org]-ethereum-org-website.ethereum-org-runner-1.service
```

### 5. Alternative: Run Interactively (Development)

```bash
# Run in foreground (useful for testing)
./run.sh
```

## Runner Configuration

### Environment Setup

Create a `.env` file in the runner's work directory:

```bash
# ~/actions-runner/_work/.env
NODE_ENV=production
NEXT_PUBLIC_BUILD_LOCALES=en
RUNNER_ALLOW_RUNASROOT=false
```

### Pre-installed Tools

Pre-install common dependencies to speed up workflows:

```bash
# Install playwright browsers (for e2e tests)
npx playwright install --with-deps chromium

# Pre-cache common npm packages
cd ~/actions-runner/_work/ethereum-org-website/ethereum-org-website
pnpm install --frozen-lockfile
```

### Labels

Configure runner labels for targeted workflow execution:

**Default Labels:**
- `self-hosted`
- `Linux`
- `X64`

**Custom Labels:**
- `ethereum-org` - Primary identifier
- `nodejs` - Node.js environment ready
- `pnpm` - pnpm package manager installed
- `fast-build` - High-performance machine

Add custom labels during configuration or update via:
```bash
./config.sh --labels "ethereum-org,nodejs,pnpm,fast-build"
```

## Workflow Integration

### Basic Usage

Update workflow files to use self-hosted runners:

```yaml
# .github/workflows/build.yml
name: Build with Self-Hosted Runner

on:
  push:
    branches: [dev]
  pull_request:
    branches: [dev]

jobs:
  build:
    runs-on: [self-hosted, ethereum-org, nodejs]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build
        run: pnpm build
```

### Hybrid Approach (Recommended)

Use both GitHub-hosted and self-hosted runners:

```yaml
# .github/workflows/ci.yml
name: Hybrid CI

on: [push, pull_request]

jobs:
  # Fast checks on GitHub-hosted
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm lint
  
  # Heavy builds on self-hosted
  build:
    runs-on: [self-hosted, ethereum-org]
    steps:
      - uses: actions/checkout@v4
      - run: pnpm build
  
  # Security scans on GitHub-hosted (more secure)
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm audit
```

## Monitoring and Maintenance

### Health Checks

Monitor runner health regularly:

```bash
# Check service status
sudo systemctl status actions.runner.*.service

# View logs
sudo journalctl -u actions.runner.*.service -f

# Check disk space
df -h ~/actions-runner/_work

# Check resource usage
htop
```

### Automated Monitoring Workflow

```yaml
# .github/workflows/runner-health.yml
name: Runner Health Check

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  health-check:
    runs-on: [self-hosted, ethereum-org]
    steps:
      - name: Check disk space
        run: |
          df -h
          if [ $(df -h / | tail -1 | awk '{print $5}' | sed 's/%//') -gt 80 ]; then
            echo "Warning: Disk usage above 80%"
            exit 1
          fi
      
      - name: Check memory
        run: free -h
      
      - name: Report status
        run: echo "Runner is healthy"
```

### Cleanup Tasks

Regular maintenance to prevent disk space issues:

```bash
# Clean Docker (if applicable)
docker system prune -af --volumes

# Clean npm/pnpm cache
pnpm store prune

# Clean old workflow runs
cd ~/actions-runner/_work/ethereum-org-website/ethereum-org-website
git clean -fdx

# Clean logs older than 7 days
find ~/actions-runner/_diag -type f -name "*.log" -mtime +7 -delete
```

### Automated Cleanup Script

```bash
#!/bin/bash
# ~/actions-runner/cleanup.sh

echo "Starting cleanup..."

# Stop runner
sudo ./svc.sh stop

# Clean work directory (except current)
find ~/actions-runner/_work -maxdepth 1 -type d -mtime +1 -exec rm -rf {} +

# Clean diagnostics
find ~/actions-runner/_diag -name "*.log" -mtime +7 -delete

# Clean package caches
pnpm store prune

# Start runner
sudo ./svc.sh start

echo "Cleanup complete"
```

Add to crontab:
```bash
# Run cleanup daily at 2 AM
0 2 * * * ~/actions-runner/cleanup.sh
```

## Security Considerations

### Isolation

- **Network**: Use firewall rules to restrict outbound connections
- **User**: Run runner as non-root user with minimal permissions
- **Secrets**: Never log secrets; use GitHub's encrypted secrets

### Updates

Keep runner software updated:

```bash
# Check for updates
cd ~/actions-runner
./run.sh --check

# Update runner
sudo ./svc.sh stop
./config.sh remove --token [REMOVAL_TOKEN]
# Download and extract new version
./config.sh --url [URL] --token [NEW_TOKEN]
sudo ./svc.sh install
sudo ./svc.sh start
```

### Access Control

- Limit runner access to specific repositories
- Use runner groups for organization-level runners
- Implement IP allowlisting if possible

## Troubleshooting

### Runner Not Connecting

```bash
# Check service status
sudo systemctl status actions.runner.*.service

# View recent logs
sudo journalctl -u actions.runner.*.service -n 50

# Test network connectivity
curl -I https://github.com

# Verify configuration
cat ~/actions-runner/.runner
```

### Workflow Failures

```bash
# Check available disk space
df -h

# Check memory
free -h

# View workflow logs
tail -f ~/actions-runner/_diag/Runner_*.log
```

### Performance Issues

```bash
# Monitor CPU usage
top -bn1 | grep "Cpu(s)"

# Check I/O wait
iostat -x 1 5

# Analyze slow queries
pnpm build --verbose
```

## Scaling

### Multiple Runners

Deploy multiple runners for parallelization:

```bash
# Runner 1
./config.sh --name ethereum-org-runner-1 --labels ethereum-org,nodejs

# Runner 2
./config.sh --name ethereum-org-runner-2 --labels ethereum-org,nodejs

# Runner 3 (specialized)
./config.sh --name ethereum-org-runner-3 --labels ethereum-org,nodejs,heavy-builds
```

### Load Balancing

GitHub automatically distributes jobs across available runners with matching labels.

## Migration Guide

### From GitHub-Hosted to Self-Hosted

1. Deploy and test runners
2. Update workflows incrementally
3. Monitor performance and reliability
4. Roll back if issues arise

**Phased Rollout:**

```yaml
# Week 1: Test on dev branch only
jobs:
  build:
    runs-on: ${{ github.ref == 'refs/heads/dev' && '[self-hosted, ethereum-org]' || 'ubuntu-latest' }}
```

## Additional Resources

- [GitHub Actions Runner Documentation](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Runner Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Monitoring with Prometheus](https://github.com/actions/runner/blob/main/docs/adrs/0291-runner-monitoring.md)

---

**Document Maintainer**: DevOps Team
**Last Updated**: February 2026
**Review Cycle**: Quarterly
