# GitHub Repository Rulesets

## Overview

This document describes the repository protection rules (rulesets) configured for the ethereum.org repository. These rules help maintain code quality, security, and consistency across all contributions.

## What are Rulesets?

GitHub Rulesets are repository-level rules that:
- Protect important branches from unwanted changes
- Enforce code review requirements
- Ensure quality checks pass before merging
- Maintain a consistent contribution workflow

## Ruleset Configuration

### 1. Main Branch Protection

**Branch**: `main` (production)

**Rules**:
- ✅ Require pull request before merging
- ✅ Require 2 approvals from core maintainers
- ✅ Dismiss stale approvals when new commits are pushed
- ✅ Require review from code owners
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Require linear history (no merge commits)
- ✅ Block force pushes
- ✅ Block deletions
- ❌ Allow bypasses for administrators (disabled for consistency)

**Required Status Checks**:
- `build` - Build must succeed
- `lint` - Linting must pass
- `chromatic` - Visual regression tests must pass
- `playwright` - E2E tests must pass (when applicable)

**Applies to**:
- Repository administrators
- Maintainers
- Contributors

### 2. Development Branch Protection

**Branch**: `dev` (staging)

**Rules**:
- ✅ Require pull request before merging
- ✅ Require 1 approval from maintainers
- ✅ Dismiss stale approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Block force pushes
- ❌ Allow bypasses for core maintainers (for hotfixes)

**Required Status Checks**:
- `build` - Build must succeed
- `lint` - Linting must pass

**Applies to**:
- All contributors
- Bypass available for core maintainers in emergencies

### 3. Tag Protection

**Pattern**: `v*.*.*` (version tags)

**Rules**:
- ✅ Block deletions
- ✅ Block updates
- ✅ Restrict tag creation to maintainers

**Purpose**: Ensure release tags are immutable and only created by authorized personnel

### 4. Release Branch Protection

**Pattern**: `release/*`

**Rules**:
- ✅ Require pull request before merging
- ✅ Require 2 approvals from core maintainers
- ✅ Require all status checks to pass
- ✅ Block force pushes
- ✅ Block deletions

### 5. Workflow File Protection

**Files**: `.github/workflows/*.yml`

**Rules**:
- ✅ Require 2 reviews from security-aware maintainers
- ✅ Require CODEOWNERS approval
- ✅ Additional security review for workflow changes

**Rationale**: Workflow files can execute arbitrary code and access secrets

## Configuring Rulesets via GitHub UI

### Method 1: Web Interface (Recommended)

1. Navigate to: `https://github.com/[org]/ethereum-org-website/settings/rules`
2. Click **"New branch ruleset"** or **"New tag ruleset"**
3. Configure rules according to specifications above
4. Set enforcement status to **"Active"**
5. Define target branches or tags
6. Save ruleset

### Method 2: GitHub API

```bash
# Create ruleset via API
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/[org]/ethereum-org-website/rulesets \
  -d @ruleset-main.json
```

Example `ruleset-main.json`:

```json
{
  "name": "Main Branch Protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 2,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "required_status_checks": [
          {"context": "build"},
          {"context": "lint"},
          {"context": "chromatic"},
          {"context": "playwright"}
        ],
        "strict_required_status_checks_policy": true
      }
    },
    {
      "type": "non_fast_forward",
      "parameters": {}
    },
    {
      "type": "deletion",
      "parameters": {}
    }
  ],
  "bypass_actors": []
}
```

## Status Check Requirements

### Build Check (`build`)

**Defined in**: `.github/workflows/node.js.yml`

**Requirements**:
- Clean npm/pnpm install
- Successful TypeScript compilation
- Successful Next.js build
- All assets generated

**Failure Criteria**:
- TypeScript errors
- Build errors
- Out of memory errors

### Lint Check (`lint`)

**Defined in**: `.github/workflows/node.js.yml`

**Requirements**:
- ESLint passes with no errors
- Prettier formatting is correct
- No TypeScript type errors

**Failure Criteria**:
- Linting errors (warnings allowed)
- Formatting violations
- Type errors

### Chromatic Check (`chromatic`)

**Defined in**: `.github/workflows/chromatic.yml`

**Requirements**:
- Storybook builds successfully
- No unreviewed visual changes
- All stories render without errors

**Failure Criteria**:
- Visual regressions detected
- Storybook build failures

### Playwright Check (`playwright`)

**Defined in**: `.github/workflows/playwright.yml`

**Requirements**:
- E2E tests pass
- No accessibility violations
- Performance metrics within thresholds

**Trigger**: Runs on PRs modifying:
- `app/**/*`
- `src/components/**/*`
- Core functionality

## Enforcement Levels

### Active Enforcement

- **Status**: Enabled by default
- **Effect**: Rules must be satisfied to merge
- **Use case**: Production and development branches

### Evaluate Mode

- **Status**: Available for testing
- **Effect**: Rules are checked but don't block merges
- **Use case**: Testing new rules before activation

### Disabled

- **Status**: Rule exists but is not enforced
- **Effect**: No restrictions applied
- **Use case**: Temporary bypass during migrations

## Bypass Mechanisms

### Emergency Hotfix Process

For critical production issues:

1. **Identify**: Confirm issue severity warrants bypass
2. **Communicate**: Notify team in Discord #dev-urgent
3. **Document**: Create tracking issue explaining bypass
4. **Execute**: Core maintainer applies emergency fix
5. **Follow-up**: Create PR for proper review post-deployment

**Authorized Personnel**: Core maintainers only

### Automated Bypasses

Certain automation can bypass rules:

- **Dependabot**: Security updates can auto-merge if all checks pass
- **Release automation**: Version bump commits from trusted CI
- **Translation sync**: Crowdin automated PRs for translations

## Rule Exceptions

### Translation Files

**Path**: `src/intl/**/*.json`

**Relaxed Rules**:
- 1 approval required (instead of 2)
- Code owner review optional
- Crowdin bot can auto-merge

**Rationale**: High volume of translation PRs from trusted source

### Documentation Only

**Path**: `docs/**/*.md`, `public/content/**/*.md`

**Relaxed Rules**:
- 1 approval required
- Build check optional

**Rationale**: Documentation changes are low-risk

## Monitoring and Alerts

### Ruleset Bypass Notifications

When rules are bypassed:
- Alert sent to #dev-alerts Discord channel
- Email notification to security team
- GitHub audit log entry created

### Failed Status Checks

- Commenter receives notification
- Maintainers alerted after 24 hours without resolution
- Auto-close PR after 30 days of inactivity

## Updating Rulesets

### Process

1. **Proposal**: Open issue with `governance` label
2. **Discussion**: Allow 1 week for community feedback
3. **Approval**: Requires consensus from core maintainers
4. **Testing**: Enable in "Evaluate" mode for 1 week
5. **Activation**: Promote to "Active" enforcement
6. **Documentation**: Update this document

### Version Control

While rulesets are configured in GitHub UI, document all changes:

```bash
# docs/rulesets-changelog.md
## 2026-02-17
- Added main branch protection with 2-approval requirement
- Configured required status checks (build, lint, chromatic)
- Enabled tag protection for v*.*.* pattern
```

## Troubleshooting

### "Merge blocked by branch protection rule"

**Cause**: PR doesn't satisfy ruleset requirements

**Solution**:
1. Check which status checks are failing
2. Address issues in your PR
3. Request required reviews
4. Ensure branch is up to date

### "Need 2 approvals but only have 1"

**Cause**: Main branch requires 2 maintainer approvals

**Solution**:
1. Ping maintainers in PR comments
2. Mention in Discord #dev channel
3. Wait for second review
4. If urgent, discuss in #dev-urgent

### "Status check is stuck"

**Cause**: CI job may be queued or failed

**Solution**:
1. Check Actions tab for job status
2. Re-run failed checks if flaky
3. Fix code if legitimate failure
4. Contact DevOps if infrastructure issue

### "Need code owner review"

**Cause**: Modified files require CODEOWNERS approval

**Solution**:
1. Check `.github/CODEOWNERS` for required reviewers
2. Request review from listed owners
3. Engage in PR discussion to expedite

## Best Practices

### For Contributors

- ✅ Keep PRs focused and small
- ✅ Ensure all checks pass before requesting review
- ✅ Address review feedback promptly
- ✅ Keep branch up to date with target

### For Maintainers

- ✅ Review PRs within 5 business days
- ✅ Provide constructive feedback
- ✅ Approve only when confident in changes
- ✅ Use "Request changes" for blocking issues

### For the Organization

- ✅ Regularly review ruleset effectiveness
- ✅ Update rules as project evolves
- ✅ Balance security with contributor experience
- ✅ Document all rule changes

## Additional Resources

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [Branch Protection Best Practices](https://docs.github.com/en/code-security/securing-your-repository/about-protected-branches)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Ownership & Governance](./ownership.md)

---

**Document Maintainer**: DevOps & Core Team
**Last Updated**: February 2026
**Review Cycle**: Quarterly
