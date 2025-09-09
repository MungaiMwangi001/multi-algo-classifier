import React, { createContext, useContext, useState } from 'react';

const TabContext = createContext();

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
};

export const TabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dataset');

  const value = {
    activeTab,
    setActiveTab
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};