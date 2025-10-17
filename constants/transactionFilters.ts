// constants/transactionFilters.ts

// Wallet Transaction Filters
export const walletTransactionFilters = [
  { name: "All", value: "" },
  { name: "Tip", value: "tip" },
  { name: "Project Tip", value: "project_tip" },
  { name: "Project Watching", value: "project_watching" },
  { name: "Transfer", value: "transfer" },
  { name: "Deposit", value: "deposit" },
  { name: "Withdrawal", value: "withdrawal" },
  { name: "Payment", value: "payment" },
];

// Project Transaction Filters
export const projectTransactionFilters = [
  { name: "All", value: "all" },
  { name: "Watching", value: "project_watching" },
  { name: "Tips", value: "project_tip" },
];
