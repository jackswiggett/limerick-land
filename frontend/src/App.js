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
import { validateLines, userId } from "./userInfo";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineID: null
    };
  }
  
  componentWillMount() {
    this.fetchRandomPoem();
  }
  
  fetchRandomPoem = () => {
    axios
            .get(`${API_URL}/randpoem`, {
                params: {
                    validateLines,
                }
            })
            .then(response => {
                var result = response.data.lineId;
                this.setState({
                    lineID: result,
                });
            });
  }
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
          </div>
            <Route exact path="/" component={Home} />
            <div className="random-container">
              {this.state.lineID !== null && 
                <Link className="randButton" to={`/line/${this.state.lineID}`}>
                  <button className="submit-random" onClick={this.fetchRandomPoem}>Generate a limerick</button>
                </Link>
              }
              <Route path="/line/:lineId" component={Line} />
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;