// SPDX-License-Identifier: MIT-0

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppLayout, { AppLayoutProps } from '@cloudscape-design/components/app-layout';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import Autosuggest, { AutosuggestProps } from '@cloudscape-design/components/autosuggest';
import SegmentedControl from '@cloudscape-design/components/segmented-control';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Badge from '@cloudscape-design/components/badge';
import Alert from '@cloudscape-design/components/alert';
import Spinner from '@cloudscape-design/components/spinner';
import Link from '@cloudscape-design/components/link';

import '../../styles/base.scss';
import styles from './styles.module.scss';

interface CityOption {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

type Unit = 'celsius' | 'fahrenheit';

interface ForecastDay {
  date: string; // ISO date
  max: number;
  min: number;
  code: number;
}

function formatCityOption(c: CityOption) {
  const parts = [c.name, c.admin1, c.country].filter(Boolean);
  return parts.join(', ');
}

function getEmojiForWeatherCode(code: number): string {
  // Mapping based on WMO weather interpretation codes
  // 0 Clear sky
  if (code === 0) return '☀️';
  // 1,2,3 Mainly clear, partly cloudy, and overcast
  if ([1, 2, 3].includes(code)) return '🌤️';
  // 45,48 Fog and depositing rime fog
  if ([45, 48].includes(code)) return '🌫️';
  // 51,53,55 Drizzle
  if ([51, 53, 55].includes(code)) return '🌦️';
  // 56,57 Freezing Drizzle
  if ([56, 57].includes(code)) return '🥶🌦️';
  // 61,63,65 Rain
  if ([61, 63, 65].includes(code)) return '🌧️';
  // 66,67 Freezing Rain
  if ([66, 67].includes(code)) return '🥶🌧️';
  // 71,73,75 Snow fall
  if ([71, 73, 75].includes(code)) return '🌨️';
  // 77 Snow grains
  if (code === 77) return '❄️';
  // 80,81,82 Rain showers
  if ([80, 81, 82].includes(code)) return '🌦️';
  // 85,86 Snow showers
  if ([85, 86].includes(code)) return '🌨️';
  // 95 Thunderstorm
  if (code === 95) return '⛈️';
  // 96,99 Thunderstorm with hail
  if ([96, 99].includes(code)) return '⛈️🧊';
  return '❓';
}

function dayOfWeek(dateIso: string): string {
  const d = new Date(dateIso);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export default function WeatherDashboard() {
  const layoutRef = useRef<AppLayoutProps.Ref>(null);
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [loadingCity, setLoadingCity] = useState(false);
  const [unit, setUnit] = useState<Unit>('fahrenheit');
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autosuggestOptions: AutosuggestProps.Options = useMemo(
    () =>
      suggestions.map(s => ({
        value: formatCityOption(s),
        label: formatCityOption(s),
        description: `Lat ${s.latitude.toFixed(2)}, Lon ${s.longitude.toFixed(2)}`,
      })),
    [suggestions],
  );

  const fetchCities = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setLoadingCity(true);
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
      const data = await res.json();
      const results: CityOption[] = (data?.results || []).map((r: any) => ({
        name: r.name,
        country: r.country,
        admin1: r.admin1,
        latitude: r.latitude,
        longitude: r.longitude,
      }));
      setSuggestions(results);
    } catch (e: any) {
      setError(e?.message || 'Failed to load cities');
    } finally {
      setLoadingCity(false);
    }
  }, []);

  const fetchForecast = useCallback(
    async (city: CityOption, u: Unit) => {
      setError(null);
      setLoadingForecast(true);
      setForecast(null);
      try {
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', String(city.latitude));
        url.searchParams.set('longitude', String(city.longitude));
        url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min');
        url.searchParams.set('temperature_unit', u);
        url.searchParams.set('timezone', 'auto');
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Forecast error: ${res.status}`);
        const data = await res.json();
        const days: ForecastDay[] = (data?.daily?.time || []).map((date: string, i: number) => ({
          date,
          max: data.daily.temperature_2m_max?.[i],
          min: data.daily.temperature_2m_min?.[i],
          code: data.daily.weather_code?.[i],
        }));
        setForecast(days.slice(0, 7));
      } catch (e: any) {
        setError(e?.message || 'Failed to load forecast');
      } finally {
        setLoadingForecast(false);
      }
    },
    [],
  );

  // When unit changes, refetch for current city
  useEffect(() => {
    if (selectedCity) {
      fetchForecast(selectedCity, unit);
    }
  }, [selectedCity, unit, fetchForecast]);

  const autosuggestLoadingText = loadingCity ? 'Searching cities…' : undefined;

  return (
    <AppLayout
      navigationHide
      toolsHide
      ref={layoutRef}
      content={
        <ContentLayout
          header={
            <SpaceBetween size="m">
              <Header variant="h1" description="7-day forecast by city with unit toggle and emoji conditions.">
                Weather Forecast Dashboard
              </Header>
              <Container>
                <SpaceBetween size="m">
                  <Grid gridDefinition={[{ colspan: { default: 12, m: 7, l: 8 } }, { colspan: { default: 12, m: 5, l: 4 } }]}>
                    <div>
                      <Autosuggest
                        value={query}
                        options={autosuggestOptions}
                        onChange={({ detail }) => {
                          setQuery(detail.value);
                          if (detail.value.length >= 2) fetchCities(detail.value);
                        }}
                        onSelect={({ detail }) => {
                          const match = suggestions.find(s => formatCityOption(s) === detail.value);
                          if (match) {
                            setSelectedCity(match);
                          }
                        }}
                        filteringType="auto"
                        ariaLabel="Search city"
                        placeholder="Search city (e.g., London, New York)"
                        empty="No matches"
                        loadingText={autosuggestLoadingText}
                      />
                    </div>
                    <div>
                      <SegmentedControl
                        selectedId={unit}
                        onChange={({ detail }) => setUnit(detail.selectedId as Unit)}
                        options={[
                          { id: 'celsius', text: '°C' },
                          { id: 'fahrenheit', text: '°F' },
                        ]}
                        ariaLabel="Temperature unit"
                      />
                    </div>
                  </Grid>
                  {selectedCity && (
                    <Box variant="p">
                      Showing forecast for <strong>{formatCityOption(selectedCity)}</strong>{' '}
                      <Badge color="blue">{unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}</Badge>
                    </Box>
                  )}
                </SpaceBetween>
              </Container>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            {error && (
              <Alert type="error" header="Something went wrong">
                {error}
              </Alert>
            )}

            {!selectedCity && (
              <Container>
                <Box variant="p">
                  Start by searching for a city above to see a 7-day forecast powered by Open-Meteo. Learn more about the
                  API at <Link external href="https://open-meteo.com/">open-meteo.com</Link>.
                </Box>
              </Container>
            )}

            {loadingForecast && (
              <Container>
                <Box textAlign="center">
                  <Spinner />
                </Box>
              </Container>
            )}

            {forecast && forecast.length > 0 && (
              <Container header={<Header>7-day forecast</Header>}>
                <div className={styles['forecast-scroll-container']}>
                  <div className={styles['forecast-row']}>
                    {forecast.map(day => (
                      <Container
                        key={day.date}
                        className={styles['forecast-day-card']}
                        header={
                          <SpaceBetween size="xs" direction="horizontal">
                            <span>{dayOfWeek(day.date)}</span>
                            <span>{new Date(day.date).toLocaleDateString()}</span>
                          </SpaceBetween>
                        }
                      >
                        <SpaceBetween size="s">
                          <Box fontSize="display-l" textAlign="center">
                            {getEmojiForWeatherCode(day.code)}
                          </Box>
                          <Box textAlign="center">
                            <strong>
                              {Math.round(day.max)}° / {Math.round(day.min)}° {unit === 'celsius' ? 'C' : 'F'}
                            </strong>
                          </Box>
                        </SpaceBetween>
                      </Container>
                    ))}
                  </div>
                </div>
              </Container>
            )}
          </SpaceBetween>
        </ContentLayout>
      }
    />
  );
}
