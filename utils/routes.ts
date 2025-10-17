// utils/routes.ts
// This file contains the list of routes that should not be treated as usernames
// It's used to centralize the route definitions and avoid duplication

export const NON_USERNAME_ROUTES = [
  'watching', 'projects', 'login', 'register', 'wallet',
  'help', 'search', 'trending', 'upcoming', 'notifications',
  'checkout', 'fanning', 'fans', 'account', 'profile',
  'studio', 'premiering', 'premieres', 'watch', 'tip', 'tips',
  'orders', 'payments', 'policies', 'feedback', 'contacts',
  'talents', 'investors', 'investments', 'project', 'password',
  'protected', 'page_search_results', 'search_results', 'test'
]

// Function to check if a path segment should be treated as a username
export function isNonUsernameRoute(segment: string): boolean {
  return NON_USERNAME_ROUTES.includes(segment)
}