import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import DatasetTab from "./tabs/DatasetTab";
import TrainTab from "./tabs/TrainTab";
import ResultsTab from "./tabs/ResultsTab";
import ComparisonTab from "./tabs/ComparisonTab";

import ModelsTab from "./tabs/ModelsTab";
import { fadeIn } from "../constants/animations";

const MainContent = (props) => {
  const { isSidebarOpen, activeTab } = props;

  return (
    <div className={`flex-1 ${isSidebarOpen ? 'ml-80' : 'ml-20'} transition-margin duration-300 p-6`}>
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Machine Learning Classifier</h1>
        </div>
        <p className="text-gray-600 mt-2">Train and compare multiple ML algorithms on your dataset</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6">
        <AnimatePresence mode="wait">
          {activeTab === "dataset" && <DatasetTab {...props} />}
          {activeTab === "train" && <TrainTab {...props} />}
          {activeTab === "results" && <ResultsTab {...props} />}
          {activeTab === "comparison" && <ComparisonTab {...props} />}
          {activeTab === "models" && <ModelsTab {...props} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainContent;
