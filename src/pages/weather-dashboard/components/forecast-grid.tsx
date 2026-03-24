// SPDX-License-Identifier: MIT-0

import React from 'react';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';

interface WeatherData {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface WeatherInfo {
  emoji: string;
  description: string;
}

// Map WMO weather codes to emoji and descriptions
const getWeatherInfo = (code: number): WeatherInfo => {
  // WMO Weather interpretation codes
  // https://open-meteo.com/en/docs
  if (code === 0) return { emoji: '☀️', description: 'Clear' };
  if (code === 1 || code === 2) return { emoji: '🌤️', description: 'Mostly Clear' };
  if (code === 3) return { emoji: '☁️', description: 'Overcast' };
  if (code === 45 || code === 48) return { emoji: '🌫️', description: 'Foggy' };
  if (code === 51 || code === 53 || code === 55) return { emoji: '🌧️', description: 'Drizzle' };
  if (code === 61 || code === 63 || code === 65) return { emoji: '🌧️', description: 'Rain' };
  if (code === 71 || code === 73 || code === 75) return { emoji: '❄️', description: 'Snow' };
  if (code === 77) return { emoji: '❄️', description: 'Snow' };
  if (code === 80 || code === 81 || code === 82) return { emoji: '🌧️', description: 'Rain Showers' };
  if (code === 85 || code === 86) return { emoji: '❄️', description: 'Snow Showers' };
  if (code === 95 || code === 96 || code === 99) return { emoji: '⛈️', description: 'Thunderstorm' };
  return { emoji: '🌤️', description: 'Unknown' };
};

const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function ForecastGrid({ weatherData, isCelsius }: { weatherData: WeatherData; isCelsius: boolean }) {
  const { time, weather_code, temperature_2m_max, temperature_2m_min } = weatherData.daily;

  // Take only first 7 days
  const days = time.slice(0, 7).map((date, index) => {
    const weatherInfo = getWeatherInfo(weather_code[index]);
    return {
      date,
      dayOfWeek: getDayOfWeek(date),
      formattedDate: formatDate(date),
      emoji: weatherInfo.emoji,
      description: weatherInfo.description,
      maxTemp: Math.round(temperature_2m_max[index]),
      minTemp: Math.round(temperature_2m_min[index]),
    };
  });

  const tempUnit = isCelsius ? '°C' : '°F';

  return (
    <Grid gridDefinition={[{ colspan: { default: 12, s: 6, m: 4, l: 3, xl: 2 } }]}>
      {days.map(day => (
        <Container key={day.date} footer={null}>
          <Box padding="m" textAlign="center">
            <div style={styles.dayHeader}>
              <strong>{day.dayOfWeek}</strong>
              <div style={styles.date}>{day.formattedDate}</div>
            </div>
            <div style={styles.emoji}>{day.emoji}</div>
            <div style={styles.description}>{day.description}</div>
            <div style={styles.temperatures}>
              <div style={styles.temp}>
                <span style={styles.tempLabel}>High</span>
                <span style={styles.tempValue}>{day.maxTemp}{tempUnit}</span>
              </div>
              <div style={styles.temp}>
                <span style={styles.tempLabel}>Low</span>
                <span style={styles.tempValue}>{day.minTemp}{tempUnit}</span>
              </div>
            </div>
          </Box>
        </Container>
      ))}
    </Grid>
  );
}

const styles = {
  dayHeader: {
    marginBottom: '12px',
    fontSize: '14px',
  },
  date: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  emoji: {
    fontSize: '48px',
    margin: '12px 0',
    lineHeight: '1',
  },
  description: {
    fontSize: '13px',
    color: '#333',
    marginBottom: '12px',
    minHeight: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperatures: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: '12px',
    borderTop: '1px solid #ddd',
  },
  temp: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  tempLabel: {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase' as const,
  },
  tempValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: '4px',
  },
};
