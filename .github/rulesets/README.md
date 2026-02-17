# GitHub Rulesets Configuration

This directory contains JSON configuration files for GitHub Repository Rulesets. These configurations can be applied via the GitHub API or used as reference for manual configuration through the GitHub web interface.

## Files

### 1. `main-branch-protection.json`

Protects the `main` (production) branch with strict requirements:
- Requires 2 approvals from maintainers
- Requires code owner review
- Requires all status checks to pass (build, lint, chromatic)
- Blocks force pushes and deletions
- Requires linear history (no merge commits)
- No bypass options

### 2. `dev-branch-protection.json`

Protects the `dev` (development/staging) branch with moderate requirements:
- Requires 1 approval from maintainers
- Requires status checks to pass (build, lint)
- Blocks force pushes
- Allows maintainers to bypass for hotfixes

### 3. `tag-protection.json`

Protects version tags (v*.*.* pattern):
- Blocks tag deletion
- Blocks tag updates
- Restricts tag creation to maintainers
- Ensures release tags are immutable

## Applying Rulesets

### Option 1: GitHub Web Interface (Recommended)

1. Go to your repository settings
2. Navigate to **Rules** → **Rulesets**
3. Click **New branch ruleset** or **New tag ruleset**
4. Use the JSON files as a reference to configure rules
5. Set enforcement to **Active**
6. Save the ruleset

### Option 2: GitHub API

Use the GitHub API to programmatically create rulesets:

```bash
# Create main branch protection
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token YOUR_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/rulesets \
  -d @main-branch-protection.json

# Create dev branch protection
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token YOUR_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/rulesets \
  -d @dev-branch-protection.json

# Create tag protection
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token YOUR_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/rulesets \
  -d @tag-protection.json
```

### Option 3: GitHub CLI

```bash
# Note: As of early 2024, gh CLI doesn't have native ruleset commands
# Use API calls with gh:

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/OWNER/REPO/rulesets \
  --input main-branch-protection.json
```

## Verifying Rulesets

After applying, verify the rulesets are active:

```bash
# List all rulesets
curl -H "Accept: application/vnd.github+json" \
  -H "Authorization: token YOUR_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/OWNER/REPO/rulesets

# Or using gh CLI
gh api /repos/OWNER/REPO/rulesets
```

## Customization

These configurations are templates. Adjust them based on your needs:

- **Add/remove status checks**: Modify the `required_status_checks` array
- **Change approval count**: Update `required_approving_review_count`
- **Add bypass actors**: Include user IDs, team IDs, or role IDs in `bypass_actors`
- **Adjust enforcement**: Change from "active" to "evaluate" for testing

## Bypass Actors

The `bypass_actors` field allows certain users, teams, or roles to bypass rules:

```json
{
  "bypass_actors": [
    {
      "actor_id": 123456,
      "actor_type": "User",
      "bypass_mode": "always"
    },
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "always"
    }
  ]
}
```

**Actor Types**:
- `User` - Specific user (use GitHub user ID)
- `Team` - Organization team (use team ID)
- `RepositoryRole` - Repository role (e.g., 5 = Admin, 4 = Write)

**Bypass Modes**:
- `always` - Can always bypass
- `pull_request` - Can bypass via pull request only

## Important Notes

1. **Actor IDs**: Replace placeholder IDs with actual GitHub user/team/org IDs
2. **Enforcement Testing**: Start with `"enforcement": "evaluate"` to test rules without blocking
3. **Status Checks**: Ensure status check names match your workflow job names
4. **Breaking Changes**: Applying new rulesets may temporarily disrupt workflows until adapted

## Additional Resources

- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- [GitHub API - Rulesets](https://docs.github.com/en/rest/repos/rules)
- [Complete Ruleset Documentation](../docs/github-rulesets.md)

---

**Last Updated**: February 2026
