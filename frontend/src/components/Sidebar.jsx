import React from "react";
import { motion } from "framer-motion";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  trainAll,
  fetchDatasetInfo,
  loading
}) => {
  const navItems = [
    { id: "dataset", name: "Datasets", icon: "📊" },
    { id: "train", name: "Training", icon: "⚙️" },
    { id: "results", name: "Results", icon: "📈" },
    { id: "comparison", name: "Comparison", icon: "📋" },
    { id: "models", name: "Models", icon: "🧠" }
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      className="bg-white shadow-xl h-screen fixed left-0 top-0 z-10 overflow-hidden transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: isSidebarOpen ? 1 : 0 }}
            className="text-xl font-bold text-gray-800"
          >
            ML Dashboard
          </motion.h1>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? "❌" : "☰"}
          </button>
        </div>
        
        <nav className="space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`w-full text-left py-3 px-4 rounded-lg transition-colors flex items-center ${
                activeTab === item.id ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: isSidebarOpen ? 1 : 0 }}>
                {item.name}
              </motion.span>
            </button>
          ))}
        </nav>

        <div className="mt-8">
          <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: isSidebarOpen ? 1 : 0 }} className="text-lg font-medium text-gray-800 mb-2">
            Quick Actions
          </motion.h3>
          <button
            onClick={trainAll}
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-75 mb-2"
          >
            {loading ? "Training..." : isSidebarOpen && "Train All Algorithms"}
          </button>
          <button
            onClick={fetchDatasetInfo}
            className="w-full bg-gray-200 text-gray-800 p-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            {isSidebarOpen && "Refresh Dataset Info"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
