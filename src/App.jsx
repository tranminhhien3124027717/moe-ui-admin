import React from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes'; 
import './assets/styles/main.scss';

const App = () => (
  <ConfigProvider theme={{ token: { fontFamily: 'Inter', colorPrimary: '#1e3a8a' } }}>
    <RouterProvider router={router} />
  </ConfigProvider>
);

export default App;