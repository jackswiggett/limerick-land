import axios from "axios";
import React, { Component } from "react";
import ReactGA from "react-ga";
import FaExclamationTriangle from "react-icons/lib/fa/exclamation-triangle";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import headerImg from "./header.png";
import rulesImg from "./rules.png";
import { Router, Route, Link } from "react-router-dom";
import "./App.css";
import "./Line.css";
import Home from "./Home";
import { API_URL } from "./constants";
import Line from "./Line";
import history from "./routerHistory";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineID: null,
      showHelp: true
    };

    // Add your tracking ID created from https://analytics.google.com/analytics/web/#home/
    ReactGA.initialize("UA-119824484-1");
    ReactGA.pageview(window.location.pathname);

    this.reportInappropriateContent = this.reportInappropriateContent.bind(
      this
    );
  }

  componentWillMount() {
    this.fetchRandomPoem();
  }

  fetchRandomPoem = () => {
    axios.get(`${API_URL}/randpoem`).then(response => {
      var result = response.data.lineId;
      this.setState({
        lineID: result
      });
    });
  };

  reportInappropriateContent() {
    const reportContentSubject = encodeURIComponent(
      "Report inappropriate content"
    );

    const reportContentBody = encodeURIComponent(
      "Thank you for taking the time to report inappropriate content. " +
        'Please fill in the following information and click "send". ' +
        "We will review your email and remove the content if necessary.\n\n" +
        "URL: " +
        window.location.href +
        "\n\n" +
        "Reason for reporting content:" +
        "\n\n"
    );

    const reportContentURL =
      "mailto:limericklandcontact@gmail.com" +
      "?subject=" +
      reportContentSubject +
      "&body=" +
      reportContentBody;

    window.open(reportContentURL);
  }

  render() {
    return (
      <Router history={history}>
        <div className="App">
          <div className="App-report-content-box">
            <a onClick={this.reportInappropriateContent}>
              <FaExclamationTriangle className="App-report-icon" />
              {"Report inappropriate content"}
            </a>
          </div>
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
                onClick={() => {
                  this.fetchRandomPoem();
                  this.setState({ showHelp: false });
                }}
                to={`/line/${this.state.lineID}`}
              >
                View Random Limerick
              </Link>
            ) : null}
          </div>
          <div className="App-help-wrapper">
            <div className="App-help">
              <div style={{ display: this.state.showHelp ? "block" : "none" }}>
                <div className="App-introduction">
                  <h3>About Us</h3>
                  <p>
                    Limerick Land is a collaborative platform for building fun
                    and creative limericks. You can browse, create your own, and
                    build off of others. Feel free to use a{" "}
                    <a target="_blank" href="https://www.rhymezone.com/">
                      rhyming dictionary
                    </a>{" "}
                    or any other assistance in crafting your lines. If you have
                    any feedback or questions, contact us at{" "}
                    <a
                      target="_blank"
                      href="mailto:limericklandcontact@gmail.com"
                    >
                      limericklandcontact@gmail.com
                    </a>.
                  </p>
                </div>
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