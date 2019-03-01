import React from 'react';
import ReactDOM from 'react-dom';
import thunkMiddleware from "redux-thunk";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import './vendors/animate.css';
import "semantic-ui-css/semantic.min.css";
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import rootReducer from './redux/rootReducer';

export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("root")
  );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
