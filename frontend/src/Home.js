import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { API_URL } from './constants';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstLine: '',
      firstLines: [],
    };

    this.editFirstLine = this.editFirstLine.bind(this);
    this.submitFirstLine = this.submitFirstLine.bind(this);
  }

  fetchFirstLines() {
    axios.get(`${API_URL}/firstline`).then((response) => {
      this.setState({
        firstLines: response.data,
      });
    });
  }

  componentDidMount() {
    this.fetchFirstLines();
  }

  editFirstLine(event) {
    this.setState({
      firstLine: event.target.value,
    });
  }

  submitFirstLine() {
    // don't submit an empty string as the first line
    if (this.state.firstLine.length === 0) return;

    axios.post(`${API_URL}/firstline`, {
      text: this.state.firstLine,
    }).then(() => {
      this.setState({
        firstLine: '',
      });
      this.fetchFirstLines();
    });
  }

  render() {
    return (
      <div className="Home">
        
        <h3>
          Enter a first line for a limerick:
        </h3>
        <div className="entry">
            <input
              className="Home-first-line"
              value={this.state.firstLine}
              onChange={this.editFirstLine}
            />
            <button className="submit" onClick={this.submitFirstLine}>Submit First Line</button>
        </div>
        <h3>Choose a first line:</h3>
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
