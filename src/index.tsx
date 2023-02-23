import App from "./app"
import React from 'react'
import { createRoot } from 'react-dom/client';

const devMode = process.env.NODE_ENV === "development"

const container = document.getElementById('root');
const root = createRoot(container!);

if(devMode && module && module.hot){
    module.hot.accept()
}

root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );