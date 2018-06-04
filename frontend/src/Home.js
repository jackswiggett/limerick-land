import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "./constants";
import "./Home.css";
import LineInput from "./LineInput";
import history from "./routerHistory";
import { userId } from "./userInfo";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstLines: []
    };

    this.submitFirstLine = this.submitFirstLine.bind(this);
  }

  fetchFirstLines() {
    axios.get(`${API_URL}/firstline`).then(response => {
      this.setState({
        firstLines: response.data
      });
    });
  }

  componentDidMount() {
    this.fetchFirstLines();
  }

  async submitFirstLine(firstLine) {
    try {
      const response = await axios.post(`${API_URL}/firstline`, {
        text: firstLine,
        userId
      });
      history.push(`/line/${response.data.lineId}`);
      toast.success("Line submitted successfully!");
    } catch (e) {
      toast.error(e.message || "An error occurred!");
    }
  }

  render() {
    return (
      <div className="Home centered-col">
        <LineInput currentLimerick={[]} onSubmit={this.submitFirstLine} />
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