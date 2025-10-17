// types/snackbar.ts
export interface SnackbarOptions {
  message: string;
  color?: "success" | "error" | "warning" | "info";
  timeout?: number;
  position?: "top" | "bottom";
  icon?: string;
}
