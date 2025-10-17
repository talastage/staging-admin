// components/navigation/menu/sidebar/walletMenu.ts
import { markRaw } from 'vue'
import {
  CashIcon,
  DetailsIcon,
  ReceiptIcon,
  SettingsIcon,
  HomeIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  ArrowUpIcon,
  ClockIcon,
} from 'vue-tabler-icons'

export default function createWalletMenu() {
  const menu = [
    {
      title: 'Home',
      icon: markRaw(HomeIcon),
      to: '/',
    },
    {
      title: 'Your Wallet',
      icon: markRaw(DetailsIcon),
      to: '/wallet',
    },
    {
      title: 'Deposits',
      icon: markRaw(ArrowDownIcon),
      to: '/wallet/transactions/deposits',
    },
    {
      title: 'Transfers',
      icon: markRaw(ArrowsRightLeftIcon),
      to: '/wallet/transactions/transfers',
    },
    {
      title: 'Withdrawals',
      icon: markRaw(ArrowUpIcon),
      to: '/wallet/transactions/withdrawals',
    },
    {
      title: 'Withdrawal Requests',
      icon: markRaw(ClockIcon),
      to: '/wallet/transactions/withdrawal-requests',
    },
    {
      title: 'Wallet Settings',
      icon: markRaw(SettingsIcon),
      to: '/wallet/settings',
    },
  ]

  return menu
}
