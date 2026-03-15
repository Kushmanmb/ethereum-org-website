#!/usr/bin/env node

/**
 * Contract Verification Script
 *
 * Verifies that contract addresses defined in src/data/addresses.ts exist on
 * Ethereum mainnet and have bytecode deployed (i.e., are smart contracts, not
 * externally owned accounts).
 *
 * Optionally uses the Etherscan API (ETHERSCAN_API_KEY) to retrieve
 * additional contract details such as ABI and verification status.
 *
 * Usage:
 *   node scripts/verify-contract.js
 *   ETHERSCAN_API_KEY=<key> node scripts/verify-contract.js
 */

"use strict"

const https = require("https")
const path = require("path")

// Enable loading of TypeScript sources (e.g., src/data/addresses.ts).
require("ts-node").register({
  transpileOnly: true,
  project: path.join(__dirname, "..", "tsconfig.json"),
  // Explicitly compile TypeScript files to CommonJS so they can be loaded
  // via `require()` in this CommonJS script, independent of the repo tsconfig.
  compilerOptions: {
    module: "commonjs",
  },
})

// ---------------------------------------------------------------------------
// Contract data (imported from src/data/addresses.ts)
// ---------------------------------------------------------------------------

const addressesModule = require("../src/data/addresses.ts")
const CONTRACTS = addressesModule.CONTRACTS || []

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api"
const ETH_RPC_URL = "https://ethereum-rpc.publicnode.com"

/** Perform a JSON-RPC call against a public Ethereum node. */
function rpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    })

    const url = new URL(ETH_RPC_URL)
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }

    const req = https.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            reject(new Error(`RPC error: ${JSON.stringify(parsed.error)}`))
          } else {
            resolve(parsed.result)
          }
        } catch (e) {
          reject(new Error(`Failed to parse RPC response: ${data}`))
        }
      })
    })

    // Prevent stalled RPC connections from hanging the process.
    req.setTimeout(10000, () => {
      req.destroy(new Error("RPC request timed out"))
    })

    req.on("error", reject)
    req.write(body)
    req.end()
  })
}

/** Fetch contract ABI from Etherscan to confirm it is verified on-chain. */
function etherscanGetAbi(address, apiKey) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      chainid: "1",
      module: "contract",
      action: "getabi",
      address,
      apikey: apiKey,
    })

    const urlStr = `${ETHERSCAN_API_URL}?${params.toString()}`
    const url = new URL(urlStr)

    const req = https.get(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}?${url.searchParams.toString()}`,
        headers: { Accept: "application/json" },
      },
      (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(new Error(`Failed to parse Etherscan response: ${data}`))
          }
        })
      }
    )

    // Prevent stalled Etherscan connections from hanging the process.
    req.setTimeout(10000, () => {
      req.destroy(new Error("Etherscan request timed out"))
    })

    req.on("error", reject)
  })
}

// ---------------------------------------------------------------------------
// Verification logic
// ---------------------------------------------------------------------------

// EIP-1967 standard proxy implementation storage slot:
// keccak256("eip1967.proxy.implementation") - 1
const EIP1967_IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"

/**
 * Reads the EIP-1967 implementation storage slot of a potential proxy
 * contract.  Returns the implementation address (lowercase hex) when the slot
 * is non-zero, or null when the contract does not appear to be an EIP-1967
 * proxy.
 */
async function getProxyImplementation(address) {
  let slot
  try {
    slot = await rpcCall("eth_getStorageAt", [
      address,
      EIP1967_IMPLEMENTATION_SLOT,
      "latest",
    ])
  } catch {
    return null
  }

  // eth_getStorageAt returns a 32-byte hex string (66 chars including "0x").
  // A value of all-zeros means the slot is unset (not a proxy).
  if (!slot || /^0x0*$/.test(slot)) {
    return null
  }

  // Ensure the response is a full 32-byte value before slicing.
  // A valid storage slot value is "0x" followed by exactly 64 hex characters.
  if (slot.length < 42) {
    return null
  }

  // The implementation address occupies the rightmost 20 bytes (40 hex chars).
  const implAddress = "0x" + slot.slice(-40)

  // Guard against an all-zero address.
  if (/^0x0{40}$/.test(implAddress)) {
    return null
  }

  return implAddress
}

/**
 * Checks whether the contract is an EIP-1967 proxy and, when it is, also
 * verifies that the implementation contract has bytecode deployed on mainnet.
 * Returns true when the contract is not a proxy OR when both the proxy and its
 * implementation pass verification.  Returns false only when a proxy
 * implementation is detected but fails verification.
 */
async function verifyProxy(contract) {
  const { name, address } = contract

  const implAddress = await getProxyImplementation(address)

  if (!implAddress) {
    console.log(`  ℹ  ${name}: not detected as an EIP-1967 proxy`)
    return true
  }

  console.log(`  ℹ  ${name}: EIP-1967 proxy detected`)
  console.log(`     implementation → ${implAddress}`)

  // Validate the implementation address format before querying the chain.
  if (!/^0x[0-9a-fA-F]{40}$/.test(implAddress)) {
    console.error(
      `  ✗ ${name}: proxy implementation address has invalid format "${implAddress}"`
    )
    return false
  }

  let code
  try {
    code = await rpcCall("eth_getCode", [implAddress, "latest"])
  } catch (err) {
    console.error(
      `  ✗ ${name}: failed to fetch implementation bytecode – ${err.message}`
    )
    return false
  }

  if (!code || code === "0x") {
    console.error(
      `  ✗ ${name}: proxy implementation (${implAddress}) has no bytecode – ` +
        `implementation contract not deployed`
    )
    return false
  }

  console.log(
    `  ✓ ${name}: proxy implementation (${implAddress}) bytecode confirmed`
  )
  return true
}

/**
 * Verifies that the address has contract bytecode deployed on mainnet.
 * Returns true on success, false on failure.
 */
async function verifyContractExists(contract) {
  const { name, address } = contract

  // Validate address format (EIP-55 mixed-case checksum not enforced here,
  // but the 0x + 40 hex characters format is required).
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    console.error(`  ✗ ${name}: invalid address format "${address}"`)
    return false
  }

  let code
  try {
    code = await rpcCall("eth_getCode", [address, "latest"])
  } catch (err) {
    console.error(`  ✗ ${name}: RPC call failed – ${err.message}`)
    return false
  }

  // eth_getCode returns "0x" for EOAs / undeployed addresses.
  if (!code || code === "0x") {
    console.error(
      `  ✗ ${name} (${address}): no bytecode found – address is not a contract`
    )
    return false
  }

  console.log(`  ✓ ${name} (${address}): contract bytecode confirmed`)
  return true
}

/**
 * Optionally verifies contract source on Etherscan when an API key is
 * provided.  Returns true on success (or when skipped), false on failure.
 */
async function verifyEtherscanSource(contract, apiKey) {
  if (!apiKey) {
    return true // skip gracefully when no key is provided
  }

  const { name, address } = contract
  let result
  try {
    result = await etherscanGetAbi(address, apiKey)
  } catch (err) {
    console.warn(
      `  ⚠ ${name}: Etherscan lookup failed – ${err.message} (skipping)`
    )
    return true // non-fatal
  }

  if (result.status === "1") {
    console.log(`  ✓ ${name} (${address}): source verified on Etherscan`)
    return true
  }

  // status "0" usually means "Contract source code not verified"
  console.warn(
    `  ⚠ ${name} (${address}): not verified on Etherscan – ${result.result}`
  )
  return true // non-fatal; many contracts are unverified
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const apiKey = process.env.ETHERSCAN_API_KEY || ""

  console.log("=== Contract Verification ===\n")

  if (!apiKey) {
    console.log(
      "ℹ  ETHERSCAN_API_KEY not set – Etherscan source checks will be skipped.\n"
    )
  }

  let allPassed = true

  for (const contract of CONTRACTS) {
    console.log(`Checking: ${contract.name}`)

    const exists = await verifyContractExists(contract)
    if (!exists) {
      allPassed = false
    }

    const proxyOk = await verifyProxy(contract)
    if (!proxyOk) {
      allPassed = false
    }

    await verifyEtherscanSource(contract, apiKey)

    console.log()
  }

  if (allPassed) {
    console.log("✅ All contracts verified successfully.")
    process.exit(0)
  } else {
    console.error("❌ One or more contracts failed verification.")
    process.exit(1)
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err)
  process.exit(1)
})
