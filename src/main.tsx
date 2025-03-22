import 'typeface-noto-sans';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App.tsx';
import './index.scss';
import { BrowserRouter } from 'react-router-dom';
import ruRU from 'antd/lib/locale/ru_RU';

const { defaultAlgorithm } = theme;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,
        token: {
          fontFamily: 'Noto Sans, sans-serif',
        },
      }}
      locale={ruRU}
    >
      <App />
    </ConfigProvider>
  </BrowserRouter>
);
