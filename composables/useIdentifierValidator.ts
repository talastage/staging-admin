// useIdentifierValidator.js
import { ref } from 'vue';

export function useIdentifierValidator() {
  const identifierType = ref('');

  const validateIdentifier = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+\d{7,15}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (emailRegex.test(value)) {
      identifierType.value = 'email';
      return true;
    } else if (phoneRegex.test(value)) {
      identifierType.value = 'phone';
      return true;
    } else if (usernameRegex.test(value)) {
      identifierType.value = 'username';
      return true;
    }

    identifierType.value = '';
    return false;
  };

  return {
    validateIdentifier,
    identifierType
  };
}