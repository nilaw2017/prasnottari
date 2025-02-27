"use client";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface PointsContextType {
  points: number;
  setPoints: Dispatch<SetStateAction<number>>;
}

// Create context with proper typing and default value
const PointsContext = createContext<PointsContextType>({
  points: 0,
  setPoints: () => {},
});

// Provider component
export const PointsProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints] = useState(0);

  return (
    <PointsContext.Provider value={{ points, setPoints }}>
      {children}
    </PointsContext.Provider>
  );
};

// Hook to use the context
export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error("usePoints must be used within a PointsProvider");
  }
  return context;
};
