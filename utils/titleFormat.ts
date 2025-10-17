// utils/titleFormat.ts

// Capitalizes the first letter of each word in a string
export const capitalize = (str: string): string => {
  if (!str) return ''
  return str.replace(/(?:^|\s)\S/g, (a: string) => a.toUpperCase())
}

// Truncate a string to a specified length and add an ellipsis if needed
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) {
    return str
  }
  return `${str.slice(0, length)}...`
}

// Here you could add more string manipulation functions as needed
