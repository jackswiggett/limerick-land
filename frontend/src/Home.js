import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import syllable from "syllable";
import "./Home.css";
import { API_URL } from "./constants";
import { validateLines, userId } from "./userInfo";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstLine: "",
      firstLines: []
    };

    this.editFirstLine = this.editFirstLine.bind(this);
    this.submitFirstLine = this.submitFirstLine.bind(this);
  }

  fetchFirstLines() {
    axios
      .get(`${API_URL}/firstline`, {
        params: {
          validateLines
        }
      })
      .then(response => {
        this.setState({
          firstLines: response.data
        });
      });
  }

  componentDidMount() {
    this.fetchFirstLines();
  }

  editFirstLine(event) {
    this.setState({
      firstLine: event.target.value
    });
  }

  submitFirstLine() {
    // don't submit an empty string as the first line
    if (this.state.firstLine.length === 0) return;

    axios
      .post(`${API_URL}/firstline`, {
        text: this.state.firstLine,
        userId,
        validateLines
      })
      .then(() => {
        this.setState({
          firstLine: ""
        });
        this.fetchFirstLines();
      });
  }

  render() {
    const syllableCount = syllable(this.state.firstLine);

    return (
      <div className="Home">
        <div className="entry">
          <input
            className="Home-first-line"
            value={this.state.firstLine}
            onChange={this.editFirstLine}
            placeholder="Enter the first line of a new limerick..."
          />
          <button className="submit" onClick={this.submitFirstLine}>
            Submit
          </button>
        </div>
        <div
          className={
            syllableCount === 8 || syllableCount === 9
              ? "syllable-count green"
              : "syllable-count black"
          }
        >
          {this.state.firstLine.length > 0
            ? `Syllable Count: ${syllableCount}`
            : ""}
        </div>
        <h3>Or choose an existing one:</h3>
        {this.state.firstLines.map(firstLine => (
          <Link
            key={firstLine._id}
            className="line-link"
            to={`/line/${firstLine._id}`}
          >
            {firstLine.text}
          </Link>
        ))}
      </div>
    );
  }
}

export default Home;