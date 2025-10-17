// utils/phoneNumber.ts

/**
 * Format phone number with country code
 * @param phoneNumber - The phone number without country code
 * @param countryCode - The country phone code (e.g., "250")
 * @returns Formatted phone number with country code
 */
export function formatPhoneWithCountryCode(phoneNumber: string, countryCode: string): string {
  if (!phoneNumber || !countryCode) return ''
  
  // Remove leading zeros from phone number
  const cleanNumber = phoneNumber.replace(/^0+/, '')
  
  // Return formatted number
  return `${countryCode}${cleanNumber}`
}

/**
 * Parse phone number to extract country code and local number
 * @param fullPhoneNumber - Full phone number with country code
 * @param expectedCountryCode - Expected country code to validate against
 * @returns Object with country code and local number
 */
export function parsePhoneNumber(fullPhoneNumber: string, expectedCountryCode?: string): {
  countryCode: string
  localNumber: string
  isValid: boolean
} {
  if (!fullPhoneNumber) {
    return { countryCode: '', localNumber: '', isValid: false }
  }
  
  // Try to match country code pattern (1-4 digits) followed by local number
  const match = fullPhoneNumber.match(/^(\d{1,4})(\d+)$/)
  
  if (!match) {
    return { countryCode: '', localNumber: fullPhoneNumber, isValid: false }
  }
  
  const [, countryCode, localNumber] = match
  
  // If expected country code is provided, validate against it
  const isValid = expectedCountryCode ? countryCode === expectedCountryCode : true
  
  return {
    countryCode,
    localNumber,
    isValid
  }
}

/**
 * Validate phone number format
 * @param phoneNumber - Phone number to validate
 * @param maxLength - Maximum allowed length
 * @returns Validation result
 */
export function validatePhoneNumber(phoneNumber: string, maxLength: number = 16): {
  isValid: boolean
  error?: string
} {
  if (!phoneNumber) {
    return { isValid: false, error: 'Phone number is required' }
  }
  
  if (!/^\d+$/.test(phoneNumber)) {
    return { isValid: false, error: 'Phone number must contain only digits' }
  }
  
  if (phoneNumber.length > maxLength) {
    return { isValid: false, error: `Phone number cannot exceed ${maxLength} digits` }
  }
  
  return { isValid: true }
}