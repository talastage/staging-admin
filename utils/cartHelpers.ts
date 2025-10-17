// utils/cartHelpers.js
export const PAYMENT_TYPES = {
  PROJECT_TYPES: ['project_premiering', 'project_tip', 'project_watch'],
  TIP_TYPES: ['tip'],
  WALLET_TYPES: ['deposit', 'withdrawal'], // Grouped wallet-related operations
  TRANSACTION_TYPES: {
    INCOMING: ['deposit'],
    OUTGOING: ['withdrawal'],
  },
}

export const formatCurrency = (amount, currencyCode) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}

export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'warning',
    paid: 'success',
    failed: 'error',
    processing: 'info',
    cancelled: 'error',
    completed: 'success',
    rejected: 'error',
  }
  return statusColors[status.toLowerCase()] || 'info'
}

export const formatPayingType = (type) => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// New helper functions for wallet operations
export const isWalletOperation = (type) => {
  return PAYMENT_TYPES.WALLET_TYPES.includes(type)
}

export const getTransactionIcon = (type) => {
  const icons = {
    deposit: 'mdi-wallet-plus',
    withdrawal: 'mdi-wallet-minus',
    tip: 'mdi-gift',
    project_premiering: 'mdi-movie',
    project_watch: 'mdi-play-circle',
    project_tip: 'mdi-gift',
  }
  return icons[type] || 'mdi-cash'
}

export const getTransactionDescription = (type) => {
  const descriptions = {
    deposit: 'Amount to be added to your wallet balance',
    withdrawal: 'Amount to be withdrawn from your wallet balance',
    tip: 'Tip amount to be sent',
    project_premiering: 'Payment for project premiere',
    project_watch: 'Payment for watching project',
    project_tip: 'Tip for project creator',
  }
  return descriptions[type] || 'Transaction amount'
}
