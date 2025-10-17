/**
 * Composable for truncating text with ellipsis
 */
export function useTextTruncation() {
  /**
   * Truncates text to a specified length and adds ellipsis
   * 
   * @param text - The text to truncate
   * @param maxLength - Maximum length before truncation
   * @param addEllipsis - Whether to add ellipsis at the end
   * @returns Truncated text
   */
  const truncateText = (text: string, maxLength: number = 100, addEllipsis: boolean = true): string => {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength) + (addEllipsis ? '...' : '');
  };

  return {
    truncateText
  };
}