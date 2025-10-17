// composables/useCountryDetection.ts
import { ref, onMounted } from "vue";

interface CountryInfo {
  countryCode: string | null;
  timezone: string | null;
}

export const useCountryDetection = () => {
  const countryInfo = ref<CountryInfo>({
    countryCode: null,
    timezone: null,
  });
  const isDetecting = ref(false);
  const error = ref<string | null>(null);

  const detectCountry = async () => {
    isDetecting.value = true;
    error.value = null;

    try {
      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Try getting country from browser language
      const browserLang = navigator.language || (navigator as any).userLanguage;
      let countryCode = browserLang.split("-")[1];

      // If browser language method fails, fallback to timezone-based detection
      if (!countryCode && timezone) {
        // Extract region from timezone (e.g., 'Africa/Nairobi' -> 'KE')
        const region = timezone.split("/")[0];
        if (region === "Africa") {
          // Map common African cities to country codes
          const cityToCountry: { [key: string]: string } = {
            Nairobi: "KE",
            Dar_es_Salaam: "TZ",
            Kampala: "UG",
            Kigali: "RW",
            Bujumbura: "BI",
            Kinshasa: "CD",
            Lubumbashi: "CD",
          };
          const city = timezone.split("/")[1];
          countryCode = cityToCountry[city] || null;
        }
      }

      countryInfo.value = {
        countryCode,
        timezone,
      };
    } catch (e) {
      error.value = "Failed to detect country";
      console.error("Country detection error:", e);
    } finally {
      isDetecting.value = false;
    }
  };

  onMounted(() => {
    detectCountry();
  });

  return {
    countryInfo,
    isDetecting,
    error,
    detectCountry,
  };
};
