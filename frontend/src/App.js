import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';
import './App.css';
import Home from './Home';
import Line from './Line';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">
              <Link className="unstyled-link" to="/">
                Limerick Land
              </Link>
            </h1>
          </header>
          <Route exact path="/" component={Home} />
          <Route path="/line/:lineId" component={Line} />
        </div>
      </Router>
    );
  }
}

export default App;
