// ~/composables/useCurrencyFormatter.ts

export function useCurrencyFormatter() {
  const currencyFormatter = (
    value: number,
    currencySymbol: string,
    currencyCode: string
  ) => {
    if (!currencyCode || !currencySymbol) {
      console.error(
        'Both currency code and symbol are required for formatting.'
      )
      return null
    }
    try {
      const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)

      // Replace the currency code or symbol that Intl.NumberFormat adds with our custom symbol
      return formattedValue.replace(/^\D+/, currencySymbol)
    } catch (error) {
      console.error('Error formatting currency:', error)
      return null
    }
  }

  return { currencyFormatter }
}
