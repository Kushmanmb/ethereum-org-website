# Scripts Directory

This directory contains utility scripts for the ethereum.org website.

## Contract Verification Scripts

### verify-contract.js

**Purpose:** Verifies that contract addresses defined in `src/data/addresses.ts`
exist on Ethereum mainnet (have deployed bytecode) and are optionally verified
on Etherscan.

**Features:**
- Checks each contract via a public Ethereum JSON-RPC endpoint (`eth_getCode`)
- Confirms addresses have deployed bytecode (i.e., are smart contracts, not EOAs)
- Optionally checks Etherscan source-verification status when `ETHERSCAN_API_KEY` is set
- Exits with a non-zero status code when any contract fails verification

**Usage:**

```bash
# Without Etherscan (bytecode check only)
node scripts/verify-contract.js
# or via npm
npm run verify-contract

# With Etherscan source verification
ETHERSCAN_API_KEY=<your-key> node scripts/verify-contract.js
```

**Contracts checked:**

The set of contracts checked by this script is derived from the configuration
in `src/data/addresses.ts` (for example, from a `CONTRACTS` export). Refer to
that file for the authoritative, up-to-date list of contract names and
addresses that will be verified.

---

## Security Scripts

### check-secrets.sh

**Purpose:** Detects potential secrets in staged files before commits.

**Features:**
- Scans for API keys, tokens, and credentials
- Detects blockchain-specific secrets (private keys, mnemonics)
- Checks for AWS and GitHub credentials
- Blocks commits containing potential secrets
- Automatically runs via Husky pre-commit hook

**Usage:**

```bash
# Automatic (runs on git commit)
git commit -m "Your message"

# Manual check
npm run check-secrets
# or
./scripts/check-secrets.sh
```

**Detected Patterns:**

- API keys and secrets
- Private keys (Ethereum format: 0x + 64 hex chars)
- Mnemonic phrases and seed words
- AWS credentials (AKIA format)
- GitHub personal access tokens (ghp_, gho_)
- Generic passwords and bearer tokens
- .env files (completely blocked)

**Bypassing (Not Recommended):**

If you're certain a detection is a false positive:

```bash
git commit --no-verify -m "Your message"
```

⚠️ **Warning:** Only use `--no-verify` if you're absolutely sure the detected patterns are not real secrets.

**Examples:**

```bash
# This would be blocked (example pattern only - not a real secret):
const apiKey = "your_api_key_here_replace_with_actual_key"
const privateKey = "0xYOUR_PRIVATE_KEY_HERE_64_HEX_CHARACTERS"

# This is safe:
const apiKey = process.env.API_KEY
const privateKey = process.env.PRIVATE_KEY
```

## Maintenance

### Adding New Secret Patterns

To add new secret detection patterns, edit `scripts/check-secrets.sh` and add to the `PATTERNS` array:

```bash
PATTERNS=(
    # ... existing patterns ...
    "your_new_pattern_here"
)
```

### Testing

Test the script with known patterns:

```bash
# Create a test file with a fake secret (example only)
echo 'const key = "FAKE_TOKEN_EXAMPLE_NOT_REAL"' > test.ts
git add test.ts
git commit -m "Test" # Should be blocked

# Clean up
git reset HEAD test.ts
rm test.ts
```

## Related Documentation

- [KEY_PROTECTION_POLICY.md](../docs/KEY_PROTECTION_POLICY.md) - Complete key protection policy
- [SECURITY.md](../SECURITY.md) - Security policy and vulnerability reporting
- [BLOCKCHAIN_SECURITY_AUDIT.md](../docs/BLOCKCHAIN_SECURITY_AUDIT.md) - Security audit report
- [api-keys.md](../docs/api-keys.md) - API key configuration guide

## Support

For questions or issues:
- Open a GitHub issue
- Contact security@ethereum.org for security concerns
- Join our [Discord community](https://discord.gg/ethereum-org)
