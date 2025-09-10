import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './Components/App/App'; // ✅ ชื่อ path ถูกต้อง


const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

