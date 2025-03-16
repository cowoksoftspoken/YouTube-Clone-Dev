"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface PiPContextType {
  isPiP: boolean;
  setIsPiP: Dispatch<SetStateAction<boolean>>;
  videoId: string | null;
  setVideoId: Dispatch<SetStateAction<string | null>>;
  videoTime: number;
  setVideoTime: Dispatch<SetStateAction<number>>;
}

const PiPContext = createContext<PiPContextType | null>(null);

interface PiPProviderProps {
  children: ReactNode;
}

export function PiPProvider({ children }: PiPProviderProps) {
  const [isPiP, setIsPiP] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTime, setVideoTime] = useState<number>(0);

  return (
    <PiPContext.Provider
      value={{ isPiP, setIsPiP, videoId, setVideoId, videoTime, setVideoTime }}
    >
      {children}
    </PiPContext.Provider>
  );
}

export function usePiP() {
  const context = useContext(PiPContext);
  if (!context) {
    throw new Error("usePiP must be used within a PiPProvider");
  }
  return context;
}
