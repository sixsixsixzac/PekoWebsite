/**
 * Encodes a username to obfuscate it in URLs
 * Uses base64 encoding with URL-safe characters
 * Works in both browser and Node.js environments
 * @param username - The username to encode
 * @returns Encoded username string
 */
export function encodeUsername(username: string): string {
  if (!username) return "";
  
  // Use browser's btoa or Node.js Buffer
  let encoded: string;
  if (typeof window !== "undefined") {
    // Browser environment
    encoded = btoa(unescape(encodeURIComponent(username)));
  } else {
    // Node.js environment
    encoded = Buffer.from(username, "utf-8").toString("base64");
  }
  
  // Replace URL-unsafe characters with safe ones
  return encoded
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Decodes an encoded username from URL
 * Works in both browser and Node.js environments
 * @param encodedUsername - The encoded username from URL
 * @returns Decoded username string
 */
export function decodeUsername(encodedUsername: string): string {
  if (!encodedUsername) return "";
  
  try {
    // Restore base64 padding if needed
    let base64 = encodedUsername
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    
    // Add padding if needed (base64 strings should be multiple of 4)
    while (base64.length % 4) {
      base64 += "=";
    }
    
    // Decode from base64
    if (typeof window !== "undefined") {
      // Browser environment
      return decodeURIComponent(escape(atob(base64)));
    } else {
      // Node.js environment
      return Buffer.from(base64, "base64").toString("utf-8");
    }
  } catch (error) {
    // If decoding fails, return empty string
    // This handles edge cases where the encoded string is invalid
    return "";
  }
}

