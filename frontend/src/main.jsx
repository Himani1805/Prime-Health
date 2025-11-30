import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Redux Imports
import { Provider } from 'react-redux';
import store from './redux/store';

import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Using Redux Provider here */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);