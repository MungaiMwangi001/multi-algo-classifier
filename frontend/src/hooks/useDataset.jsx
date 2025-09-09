import React, { createContext, useContext, useState } from 'react';

const DatasetContext = createContext();

export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};

export const DatasetProvider = ({ children }) => {
  const [dataset, setDataset] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [trainingResults, setTrainingResults] = useState(null);
  const [savedModels, setSavedModels] = useState([]);

  const value = {
    dataset,
    setDataset,
    datasetInfo,
    setDatasetInfo,
    trainingResults,
    setTrainingResults,
    savedModels,
    setSavedModels
  };

  return (
    <DatasetContext.Provider value={value}>
      {children}
    </DatasetContext.Provider>
  );
};
