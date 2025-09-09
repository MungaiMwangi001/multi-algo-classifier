import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { DatasetProvider } from './hooks/useDataset'
import { TabProvider } from './hooks/useTab'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TabProvider>
      <DatasetProvider>
        <App />
      </DatasetProvider>
    </TabProvider>
  </React.StrictMode>,
)