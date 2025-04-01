interface LocationDataType {
  country: string;
  city: string;
  country_capital: string;
  timezone: string;
  languages: string;
}

export const location = async (): Promise<LocationDataType> => {
  const response = await fetch("https://ipapi.co/json/");

  const locationData = await response.json();

  return {
    country: locationData.country_code || "Unknown",
    city: locationData.city || "Unknown",
    country_capital: locationData.country_capital || "Unknown",
    timezone: locationData.timezone || "Unknown",
    languages: locationData.languages || "Unknown",
  };
};
