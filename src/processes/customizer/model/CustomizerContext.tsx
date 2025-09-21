"use client"
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import config from './config';


// Define the shape of the context state
interface CustomizerContextState {
  selectedIconId: number;
  setSelectedIconId: (id: number) => void;

  isCollapse: string;
  setIsCollapse: (collapse: string) => void;
}

// Create the context with an initial value
export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

// Define the type for the children prop
interface CustomizerContextProps {
  children: ReactNode;
}
// Create the provider component
export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  const [selectedIconId, setSelectedIconId] = useState<number>(1);
  const [isCollapse, setIsCollapse] = useState<string>(config.isCollapse);

  useEffect(() => {
    document.documentElement.setAttribute("data-sidebar-type", isCollapse);

  }, [ isCollapse]);

  return (
    <CustomizerContext.Provider
      value={{
        selectedIconId,
        setSelectedIconId,
        isCollapse,
        setIsCollapse
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};


