
import React from 'react';
import { PlayerProvider } from '../features/player/PlayerContext';

export default function AppProviders({children}){
  return <PlayerProvider>{children}</PlayerProvider>;
}
