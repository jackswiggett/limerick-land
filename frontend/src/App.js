import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import headerImg from "./header.png";
import rulesImg from "./rules.png";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./App.css";
import Home from "./Home";
import Line from "./Line";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <ToastContainer />
          <a href="/">
            <header className="App-header">
              <img
                className="header-img"
                src={headerImg}
                height="100%"
                width="100%"
                alt="limerick header with kitty on tree branch"
              />
            </header>
          </a>
          <div className="content">
          <div>
            <img
              className="rules-img"
              src={rulesImg}
              alt="limerick header with kitty on tree branch"
            />
            <hr/>
            <button className="submit-random">Generate a random poem</button>
          </div>
            <Route exact path="/" component={Home} />
            <Route path="/line/:lineId" component={Line} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;