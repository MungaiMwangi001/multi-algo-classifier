import React from 'react';
import { useTab } from '../hooks/useTab';

const Sidebar = () => {
  const { activeTab, setActiveTab } = useTab();

  // 🔍 Debugging logs
  console.log("Active tab:", activeTab);

  const tabs = [
    { id: 'dataset', label: 'Dataset', icon: '📁' },
    { id: 'train', label: 'Train Model', icon: '⚙️' },
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'comparison', label: 'Comparison', icon: '📈' },
    { id: 'models', label: 'Saved Models', icon: '💾' },
  ];

  return (
    <div className="w-64 bg-indigo-800 text-white h-full">
      <div className="p-4 text-2xl font-bold">ML Dashboard</div>
      <nav className="mt-6">
        <ul>
          {tabs.map(tab => (
            <li key={tab.id} className="px-4 py-2">
              <button
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                  activeTab === tab.id ? 'bg-indigo-900' : 'hover:bg-indigo-700'
                }`}
                onClick={() => {
                  console.log("Switching to tab:", tab.id); // 🔍 Debug click
                  setActiveTab(tab.id);
                }}
              >
                <span className="mr-3">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
