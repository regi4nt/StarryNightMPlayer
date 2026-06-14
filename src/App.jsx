
import React from 'react';
import AppProviders from './app/AppProviders';
import LegacyApp from './app/LegacyApp';

export default function App(){
  return (
    <AppProviders>
      <LegacyApp />
    </AppProviders>
  );
}
