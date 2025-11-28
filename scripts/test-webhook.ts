#!/usr/bin/env bun
/**
 * Test script for TMWEasy webhook endpoint
 * 
 * Usage:
 *   bun run scripts/test-webhook.ts
 *   bun run scripts/test-webhook.ts --url http://localhost:3000
 *   bun run scripts/test-webhook.ts --data '{"id_pay":"754349","ref1":"testpay","amount_check":"1901","amount":"19.00","date_pay":"2024-07-29 14:14"}'
 */

import crypto from "crypto"
import dotenv from "dotenv"

// Load environment variables from .env.local or .env
dotenv.config({ path: ".env.local" })
dotenv.config()

// Configuration
const DEFAULT_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
const DEFAULT_DATA = {
  id_pay: "754349",
  ref1: "testpay",
  amount_check: "1901",
  amount: "19.00",
  date_pay: "2024-07-29 14:14"
}

// Parse command line arguments
const args = process.argv.slice(2)
let baseUrl = DEFAULT_URL
let testData = DEFAULT_DATA
let apiKey: string | undefined

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === "--url" && args[i + 1]) {
    baseUrl = args[i + 1]
    i++
  } else if (arg === "--data" && args[i + 1]) {
    try {
      testData = JSON.parse(args[i + 1])
    } catch (e) {
      console.error("❌ Invalid JSON data:", e)
      process.exit(1)
    }
    i++
  } else if (arg === "--api-key" && args[i + 1]) {
    apiKey = args[i + 1]
    i++
  } else if (arg === "--help" || arg === "-h") {
    console.log(`
Usage: bun run scripts/test-webhook.ts [options]

Options:
  --url <url>        Base URL for the API (default: ${DEFAULT_URL})
  --data <json>      JSON string with payment data
  --api-key <key>    API key for signature generation (overrides env var)
  --help, -h         Show this help message

Environment Variables:
  PAYMENT_API_KEY    or PAYMENT_PASSWORD - API key for signature generation
  NEXT_PUBLIC_BASE_URL                    - Base URL (optional)

Example:
  bun run scripts/test-webhook.ts
  bun run scripts/test-webhook.ts --url http://localhost:3000
  bun run scripts/test-webhook.ts --data '{"id_pay":"123","ref1":"test","amount_check":"100","amount":"1.00","date_pay":"2024-01-01 12:00"}'
`)
    process.exit(0)
  }
}

// Get API key
if (!apiKey) {
  apiKey = process.env.PAYMENT_API_KEY || process.env.PAYMENT_PASSWORD
}

if (!apiKey) {
  console.error("❌ Error: API key not found!")
  console.error("   Set PAYMENT_API_KEY or PAYMENT_PASSWORD environment variable")
  console.error("   Or use --api-key <key> flag")
  process.exit(1)
}

// Convert data to JSON string
const dataString = JSON.stringify(testData)

// Generate signature: MD5(data:api_key)
const signatureString = `${dataString}:${apiKey}`
const signature = crypto.createHash("md5").update(signatureString).digest("hex")

console.log("🧪 Testing TMWEasy Webhook")
console.log("=" .repeat(50))
console.log("📡 URL:", `${baseUrl}/api/topup/webhook`)
console.log("📦 Data:", dataString)
console.log("🔑 API Key:", apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4))
console.log("✍️  Signature String:", signatureString.substring(0, 80) + "...")
console.log("🔐 Signature:", signature)
console.log("=" .repeat(50))
console.log()

// Test 1: Test signature generation endpoint
console.log("1️⃣  Testing signature generation endpoint...")
try {
  const testUrl = `${baseUrl}/api/topup/webhook/test?data=${encodeURIComponent(dataString)}&signature=${signature}`
  const testResponse = await fetch(testUrl)
  const testResult = await testResponse.json()
  
  if (testResult.matches) {
    console.log("✅ Signature matches! Format:", testResult.matchesFormat)
  } else {
    console.log("⚠️  Signature doesn't match expected format")
    console.log("   Expected formats:", testResult.formats)
  }
  console.log()
} catch (error) {
  console.log("⚠️  Could not test signature endpoint:", error instanceof Error ? error.message : error)
  console.log()
}

// Test 2: Send webhook request (form-urlencoded)
console.log("2️⃣  Sending webhook request (form-urlencoded)...")
try {
  const formData = new URLSearchParams()
  formData.append("data", dataString)
  formData.append("signature", signature)

  const response = await fetch(`${baseUrl}/api/topup/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  })

  const result = await response.json()
  const status = response.status

  console.log("📊 Status Code:", status)
  console.log("📥 Response:", JSON.stringify(result, null, 2))

  if (result.status === 1) {
    console.log("✅ Webhook test successful!")
  } else {
    console.log("❌ Webhook test failed:", result.error || "Unknown error")
  }
} catch (error) {
  console.error("❌ Error sending webhook request:", error instanceof Error ? error.message : error)
  if (error instanceof Error && error.stack) {
    console.error("Stack:", error.stack)
  }
  process.exit(1)
}

console.log()
console.log("=" .repeat(50))
console.log("✨ Test completed!")

