import { ref, computed } from "vue";

export function useValidation(amount, senderWallet) {
  const required = (value: string) => !!value || "Required.";

  const email = (value: string) => {
    const pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    return pattern.test(value) || "Invalid email.";
  };

  const phone = (value: string) => {
    const pattern = /^[0-9]{10,15}$/;
    return pattern.test(value) || "Invalid phone number.";
  };

  const minLength = (min: number) => (value: string) => {
    return value.length >= min || `Minimum length is ${min} characters.`;
  };

  const maxLength = (max: number) => (value: string) => {
    return value.length <= max || `Maximum length is ${max} characters.`;
  };

  const passwordStrength = (value: string) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    return (
      pattern.test(value) ||
      "Password must include upper, lower, number, and special character."
    );
  };

  const matchPassword = (password: string) => (value: string) => {
    return value === password || "Passwords do not match.";
  };

  const url = (value: string) => {
    const pattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    return pattern.test(value) || "Invalid URL.";
  };

  const numeric = (value: string) => {
    const pattern = /^[0-9]*$/;
    return pattern.test(value) || "Only numbers are allowed.";
  };

  const alpha = (value: string) => {
    const pattern = /^[A-Za-z]+$/;
    return pattern.test(value) || "Only alphabetic characters are allowed.";
  };

  const alphanumeric = (value: string) => {
    const pattern = /^[A-Za-z0-9]+$/;
    return pattern.test(value) || "Only alphanumeric characters are allowed.";
  };

  const customPattern =
    (pattern: RegExp, errorMessage: string) => (value: string) => {
      return pattern.test(value) || errorMessage;
    };

  const date = (value: string) => {
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    return pattern.test(value) || "Invalid date. Format should be YYYY-MM-DD.";
  };

  const username = (value: string) => {
    const pattern = /^[a-zA-Z0-9_]+$/;
    return (
      pattern.test(value) ||
      "Username can only contain letters, numbers, and underscores."
    );
  };

  // Amount-specific validation rules
  const amountRules = computed(() => [
    (value) => required(value),
    (value) => numeric(value),
    (value) => value > 0 || "Amount must be greater than 0",
    (value) => value <= (senderWallet?.balance || 0) || "Insufficient balance",
  ]);

  const isValid = computed(() => {
    return amountRules.value.every((rule) => rule(amount.value) === true);
  });

  return {
    required,
    email,
    phone,
    minLength,
    maxLength,
    passwordStrength,
    matchPassword,
    url,
    numeric,
    alpha,
    alphanumeric,
    customPattern,
    date,
    amountRules,
    isValid,
    username,
  };
}
