import React from 'react';
import ReactDOM from 'react-dom';
import './index.module.scss';
import * as serviceWorker from './serviceWorker';
import { App } from './App';
import { Water } from './App/water';

ReactDOM.render(
  <React.StrictMode>
    <App GL_App={Water} />
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.register();
