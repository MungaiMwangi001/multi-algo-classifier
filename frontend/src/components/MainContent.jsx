import React from 'react';
import { useTab } from '../hooks/useTab';
import DatasetTab from './tabs/DatasetTab';
import TrainTab from './tabs/TrainTab';
import ResultsTab from './tabs/ResultsTab';
import ComparisonTab from './tabs/ComparisonTab';
import ModelsTab from './tabs/ModelsTab';

const MainContent = () => {
  const { activeTab } = useTab();

  const renderTab = () => {
    switch (activeTab) {
      case 'dataset':
        return <DatasetTab />;
      case 'train':
        return <TrainTab />;
      case 'results':
        return <ResultsTab />;
      case 'comparison':
        return <ComparisonTab />;
      case 'models':
        return <ModelsTab />;
      default:
        return <DatasetTab />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {renderTab()}
    </div>
  );
};

export default MainContent;