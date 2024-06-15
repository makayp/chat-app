import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';
import NewProvider from '../newContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <NewProvider>
    {/* <React.StrictMode> */}
    <Toaster />
    <App />
    {/* </React.StrictMode> */}
  </NewProvider>
);
