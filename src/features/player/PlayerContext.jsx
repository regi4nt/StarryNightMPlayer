
import React,{createContext,useContext,useMemo,useRef} from 'react';

const PlayerContext=createContext(null);

export function PlayerProvider({children}){
  const audioManagerRef=useRef(null);
  const value=useMemo(()=>({audioManagerRef}),[]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayerFlow(){
  return useContext(PlayerContext);
}
