import axios from 'axios';
import React, { Component } from 'react';
import './App.css';
import { API_URL } from './constants';

class App extends Component {
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
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Limerick Land</h1>
        </header>
        <h3>
          Enter a first line for a limerick:
        </h3>
        <input value={this.state.firstLine} onChange={this.editFirstLine} />
        <button onClick={this.submitFirstLine}>Submit First Line</button>
        <h3>Choose a first line:</h3>
        {this.state.firstLines.map(firstLine => (
          <p
            key={firstLine._id}
            className="App-first-line"
          >
            {firstLine.text}
          </p>
        ))}
      </div>
    );
  }
}

export default App;
