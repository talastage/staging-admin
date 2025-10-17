// ~/composables/useTransactionTypeFormatter.ts

export function useTransactionTypeFormatter() {
  const formatTransactionType = (type: string): string => {
    switch (type.toLowerCase()) {
      case "project_tip":
      case "tip":
        return "Tip";
      case "project_watching":
        return "Watch";
      default:
        return type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
    }
  };

  return {
    formatTransactionType,
  };
}
