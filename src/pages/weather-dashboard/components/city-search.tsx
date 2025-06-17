// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useCallback, useRef } from 'react';
import Autosuggest from '@cloudscape-design/components/autosuggest';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { GeocodingResult } from '../types';
import { searchCities } from '../services/weather-api';

interface CitySearchProps {
  onCitySelect: (city: GeocodingResult) => void;
  isLoading?: boolean;
}

export function CitySearch({ onCitySelect, isLoading = false }: CitySearchProps) {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<{ value: string; label: string; city: GeocodingResult }[]>([]);
  const [status, setStatus] = useState<'loading' | 'finished' | 'error'>('finished');
  const abortController = useRef<AbortController | null>(null);

  const handleLoadItems = useCallback(async (detail: { filteringText: string }) => {
    const { filteringText } = detail;

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new abort controller
    abortController.current = new AbortController();

    if (!filteringText.trim()) {
      setOptions([]);
      setStatus('finished');
      return;
    }

    setStatus('loading');

    try {
      const response = await searchCities(filteringText);

      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        return;
      }

      const newOptions = (response.results || []).map(city => ({
        value: `${city.name}, ${city.country}${city.admin1 ? `, ${city.admin1}` : ''}`,
        label: `${city.name}, ${city.country}${city.admin1 ? `, ${city.admin1}` : ''}`,
        city,
      }));

      setOptions(newOptions);
      setStatus('finished');
    } catch (error) {
      // Don't show error if request was aborted
      if (!abortController.current?.signal.aborted) {
        console.error('Error searching cities:', error);
        setOptions([]);
        setStatus('error');
      }
    }
  }, []);

  const handleSelect = useCallback(
    (detail: { value: string }) => {
      const selectedOption = options.find(option => option.value === detail.value);
      if (selectedOption) {
        setValue(selectedOption.value);
        onCitySelect(selectedOption.city);
      }
    },
    [options, onCitySelect],
  );

  const statusType = status === 'error' ? 'error' : status;

  return (
    <SpaceBetween size="xs">
      <Box variant="h3">Search for a city</Box>
      <Autosuggest
        onChange={({ detail }) => setValue(detail.value)}
        onSelect={handleSelect}
        onLoadItems={handleLoadItems}
        value={value}
        options={options}
        loadingText="Searching cities..."
        statusType={statusType}
        placeholder="Enter city name..."
        ariaLabel="City search"
        disabled={isLoading}
        errorText={status === 'error' ? 'Error searching for cities. Please try again.' : undefined}
        recoveryText="Retry search"
        empty="No cities found"
      />
    </SpaceBetween>
  );
}
