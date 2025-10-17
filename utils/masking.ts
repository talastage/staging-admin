// utils/masking.ts

/**
 * Masks an email address for privacy
 * Example: john.doe@example.com -> j***e@e***e.com
 *
 * @param email The email address to mask
 * @returns The masked email address
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email
  }
  const [username, domain] = email.split('@')
  const [domainName, extension] = domain.split('.')
  const maskedUsername =
    username.length <= 2
      ? username
      : `${username.charAt(0)}${'*'.repeat(
          username.length - 2
        )}${username.charAt(username.length - 1)}`
  const maskedDomainName =
    domainName.length <= 2
      ? domainName
      : `${domainName.charAt(0)}${'*'.repeat(
          domainName.length - 2
        )}${domainName.charAt(domainName.length - 1)}`
  return `${maskedUsername}@${maskedDomainName}.${extension}`
}
