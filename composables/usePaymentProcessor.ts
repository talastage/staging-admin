// composables/usePaymentProcessor.ts
export function usePaymentProcessor() {
  const { $api } = useNuxtApp();

  const processPayment = async (paymentData: any): Promise<PaymentResponse> => {
    try {
      const { payment_method, payment_gateway } = paymentData;

      // Validate payment method specific data
      validatePaymentData(paymentData);

      const endpoint = `/api/payments/${payment_gateway.slug}/deposit`;
      const response = await $api.post(endpoint, paymentData);

      return handlePaymentResponse(response);
    } catch (error) {
      return handlePaymentError(error);
    }
  };

  const validatePaymentData = (data: any) => {
    const { payment_method, card_details, bank_account_details } = data;

    switch (payment_method.type) {
      case "card":
        if (
          !card_details?.card_number ||
          !card_details?.expiry_date ||
          !card_details?.cvv
        ) {
          throw new Error("Invalid card details");
        }
        validateCardDetails(card_details);
        break;

      case "bank_transfer":
        if (
          !bank_account_details?.account_number ||
          !bank_account_details?.account_name
        ) {
          throw new Error("Invalid bank account details");
        }
        break;
    }
  };

  const validateCardDetails = (cardDetails: any) => {
    const { card_number, expiry_date, cvv } = cardDetails;

    // Remove spaces from card number
    const cleanCardNumber = card_number.replace(/\s/g, "");

    // Basic card number validation (Luhn algorithm)
    if (!isValidCardNumber(cleanCardNumber)) {
      throw new Error("Invalid card number");
    }

    // Expiry date validation
    const [month, year] = expiry_date.split("/");
    if (!isValidExpiryDate(month, year)) {
      throw new Error("Card has expired");
    }

    // CVV validation
    if (!/^\d{3,4}$/.test(cvv)) {
      throw new Error("Invalid CVV");
    }
  };

  const isValidCardNumber = (number: string): boolean => {
    // Luhn algorithm implementation
    let sum = 0;
    let isEven = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const isValidExpiryDate = (month: string, year: string): boolean => {
    const currentDate = new Date();
    const expiryDate = new Date(parseInt("20" + year), parseInt(month) - 1, 1);
    return expiryDate > currentDate;
  };

  const handlePaymentResponse = (response: any): PaymentResponse => {
    if (response.status === "success") {
      return {
        status: "success",
        message: "Payment processed successfully",
        data: response.data,
      };
    }

    return {
      status: "failed",
      message: response.message || "Payment processing failed",
      error: response.error,
    };
  };

  const handlePaymentError = (error: any): PaymentResponse => {
    // Handle specific payment errors
    const errorMessage = getErrorMessage(error);

    return {
      status: "error",
      message: errorMessage,
      error: {
        code: error.code || "PAYMENT_ERROR",
        message: errorMessage,
      },
    };
  };

  const getErrorMessage = (error: any): string => {
    // Map common payment errors to user-friendly messages
    const errorMessages: Record<string, string> = {
      insufficient_funds: "Insufficient funds in your account",
      card_declined: "Your card was declined",
      expired_card: "This card has expired",
      invalid_card: "Invalid card details",
      processing_error: "Error processing your payment",
      invalid_account: "Invalid bank account details",
      bank_account_error: "Error processing bank account",
      default: "An error occurred while processing your payment",
    };

    const errorCode = error.code || error.response?.data?.error?.code;
    return errorMessages[errorCode] || errorMessages.default;
  };

  return {
    processPayment,
  };
}
