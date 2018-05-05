import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Line.css';
import { API_URL } from './constants';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      ancestors: [],
      children: [],
      nextLine: '',
    };
    
    this.editNextLine = this.editNextLine.bind(this);
    this.submitNextLine = this.submitNextLine.bind(this);
    this.renderLineLink = this.renderLineLink.bind(this);
  }
  
  fetchLine() {
    axios.get(`${API_URL}/line`, {
      params: { lineId: this.props.match.params.lineId },
    }).then((response) => {
      this.setState({
        text: response.data.text,
        children: response.data.children,
        ancestors: response.data.ancestors,
      });
    });
  }
  
  componentDidMount() {
    this.fetchLine();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.match.params.lineId !== this.props.match.params.lineId) {
      this.fetchLine();
    }
  }
  
  editNextLine(event) {
    this.setState({
      nextLine: event.target.value,
    });
  }
  
  submitNextLine() {
    // don't submit an empty string as the next line
    if (this.state.nextLine.length === 0) return;

    axios.post(`${API_URL}/line`, {
      text: this.state.nextLine,
      parentId: this.props.match.params.lineId,
    }).then(() => {
      this.setState({
        nextLine: '',
      });
      this.fetchLine();
    });
  }
  
  renderLineLink(line) {
    return (
      <Link
        key={line._id}
        className="line-link"
        to={`/line/${line._id}`}
      >
        {line.text}
      </Link>
    );
  }
  
  renderNextLine() {
    if (this.state.ancestors.length === 4) {
      // this limerick is complete
      return null;
    }

    return (
      <div>
        <h3>Select the next line:</h3>
        {this.state.children.map(this.renderLineLink)}
        <input
          className="Line-next-line"
          value={this.state.nextLine}
          onChange={this.editNextLine}
          placeholder="Suggest another next line..."
        />
        <button onClick={this.submitNextLine}>Submit</button>
      </div>
    )
  }

  render() {
    return (
      <div className="Line">
        {this.state.ancestors.map(this.renderLineLink)}
        <p><strong>{this.state.text}</strong></p>
        {this.renderNextLine()}
      </div>
    );
  }
}

export default Home;
