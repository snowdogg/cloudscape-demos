// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@cloudscape-design/global-styles/index.css';

import WeatherDashboard from './index';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <HashRouter>
    <WeatherDashboard />
  </HashRouter>,
);
