// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Spinner from '@cloudscape-design/components/spinner';
import Alert from '@cloudscape-design/components/alert';
import Toggle from '@cloudscape-design/components/toggle';

import { CustomAppLayout } from '../commons/common-components';
import { Breadcrumbs, Navigation, Notifications } from '../commons/common-components';
import { ForecastGrid } from './components/forecast-grid';

interface LocationSuggestion {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface WeatherData {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export function App() {
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState(false);

  // Search for location suggestions
  const handleLocationSearch = async (value: string) => {
    setLocationInput(value);
    setError(null);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=10&language=en`,
      );
      const data = await response.json();

      if (data.results) {
        setSuggestions(data.results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setError('Failed to search locations');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather data for a location with the selected temperature unit
  const fetchWeatherData = async (location: LocationSuggestion, celsius: boolean) => {
    setForecastLoading(true);
    try {
      const tempUnit = celsius ? 'celsius' : 'fahrenheit';
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&timezone=auto`,
      );
      const data = await response.json();
      setWeatherData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather forecast');
      setWeatherData(null);
    } finally {
      setForecastLoading(false);
    }
  };

  // Refetch weather when temperature unit changes
  useEffect(() => {
    if (selectedLocation) {
      fetchWeatherData(selectedLocation, isCelsius);
    }
  }, [isCelsius]);

  // Select a location and fetch weather
  const handleSelectLocation = async (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setLocationInput(`${location.name}${location.admin1 ? ', ' + location.admin1 : ''}${location.country ? ', ' + location.country : ''}`);
    setShowSuggestions(false);
    setSuggestions([]);
    fetchWeatherData(location, isCelsius);
  };

  const locationDisplay = selectedLocation
    ? `${selectedLocation.name}${selectedLocation.admin1 ? ', ' + selectedLocation.admin1 : ''}${selectedLocation.country ? ', ' + selectedLocation.country : ''}`
    : '';

  return (
    <CustomAppLayout
      contentType="dashboard"
      breadcrumbs={<Breadcrumbs items={[{ text: 'Weather Dashboard', href: '#/' }]} />}
      navigation={<Navigation activeHref="#/" />}
      notifications={<Notifications />}
      content={
        <ContentLayout
          header={
            <Header variant="h1" description="7-day weather forecast with emoji indicators">
              Weather Dashboard
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Box>
              <SpaceBetween size="m">
                <Header variant="h2">Search Location</Header>
                <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                  <Input
                    type="text"
                    placeholder="Search for a city (e.g., New York, London, Tokyo)"
                    value={locationInput}
                    onChange={({ detail }) => handleLocationSearch(detail.value)}
                    disabled={forecastLoading}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={styles.suggestionsDropdown}>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectLocation(suggestion)}
                          style={styles.suggestionItem}
                        >
                          {suggestion.name}
                          {suggestion.admin1 && `, ${suggestion.admin1}`}
                          {suggestion.country && `, ${suggestion.country}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </SpaceBetween>
            </Box>

            {error && <Alert type="error">{error}</Alert>}

            {forecastLoading && (
              <Box textAlign="center">
                <Spinner />
              </Box>
            )}

            {selectedLocation && weatherData && !forecastLoading && (
              <SpaceBetween size="m">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Header variant="h2">{locationDisplay}</Header>
                  <Toggle
                    onChange={({ detail }) => setIsCelsius(detail.checked)}
                    checked={isCelsius}
                    ariaLabel="Toggle between Celsius and Fahrenheit"
                  >
                    °{isCelsius ? 'C' : 'F'}
                  </Toggle>
                </Box>
                <ForecastGrid weatherData={weatherData} isCelsius={isCelsius} />
              </SpaceBetween>
            )}

            {selectedLocation && !weatherData && !forecastLoading && !error && (
              <Alert type="info">Select a location to view the forecast.</Alert>
            )}
          </SpaceBetween>
        </ContentLayout>
      }
    />
  );
}

const styles = {
  suggestionsDropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #b0b0b0',
    borderTop: 'none',
    maxHeight: '300px',
    overflowY: 'auto' as const,
    zIndex: 10,
  },
  suggestionItem: {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left' as const,
    cursor: 'pointer',
    fontSize: '14px',
  },
};
