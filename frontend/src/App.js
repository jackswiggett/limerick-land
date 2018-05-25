import axios from "axios";
import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import headerImg from "./header.png";
import rulesImg from "./rules.png";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./App.css";
import "./Line.css";
import Home from "./Home";
import { API_URL } from "./constants";
import Line from "./Line";
import { validateLines } from "./userInfo";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineID: null,
      showHelp: true
    };
  }

  componentWillMount() {
    this.fetchRandomPoem();
  }

  fetchRandomPoem = () => {
    axios
      .get(`${API_URL}/randpoem`, {
        params: {
          validateLines
        }
      })
      .then(response => {
        var result = response.data.lineId;
        this.setState({
          lineID: result
        });
      });
  };

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
          <div className="App-navbar">
            <Link to={"/"}>Home</Link>
            {this.state.lineID !== null ? (
              <Link
                onClick={this.fetchRandomPoem}
                to={`/line/${this.state.lineID}`}
              >
                View Random Limerick
              </Link>
            ) : null}
          </div>
          <div className="App-help-wrapper">
            <div className="App-help">
              <div style={{ display: this.state.showHelp ? "block" : "none" }}>
                <img
                  className="rules-img"
                  src={rulesImg}
                  alt="instructions for writing limericks"
                />
              </div>
              <button
                className="App-btn-help"
                onClick={() =>
                  this.setState({ showHelp: !this.state.showHelp })
                }
              >
                {this.state.showHelp ? "Hide Help" : "Show Help"}
              </button>
            </div>
          </div>
          <div className="content">
            <Route exact path="/" component={Home} />
            <Route path="/line/:lineId" component={Line} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;