// Simple test to validate the weather API integration works
async function testWeatherAPI() {
  try {
    // Test geocoding API
    const geocodingResponse = await fetch(
      'https://geocoding-api.open-meteo.com/v1/search?name=London&count=1&language=en&format=json',
    );
    const geocodingData = await geocodingResponse.json();

    if (geocodingData.results && geocodingData.results.length > 0) {
      console.log('✅ Geocoding API working - Found:', geocodingData.results[0].name);

      const city = geocodingData.results[0];

      // Test weather API
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&current=temperature_2m,weather_code&timezone=auto&forecast_days=7`,
      );
      const weatherData = await weatherResponse.json();

      if (weatherData.current && weatherData.daily) {
        console.log('✅ Weather API working - Current temp:', weatherData.current.temperature_2m + '°C');
        console.log('✅ 7-day forecast available:', weatherData.daily.time.length, 'days');
      } else {
        console.log('❌ Weather API error - Invalid response format');
      }
    } else {
      console.log('❌ Geocoding API error - No results found');
    }
  } catch (error) {
    console.log('❌ API Error:', error.message);
  }
}

testWeatherAPI();
