import axios from "axios";
import React, { Component } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./Line.css";
import { API_URL } from "./constants";
import { userId } from "./userInfo";
import LineInput from "./LineInput";
import history from "./routerHistory";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            ancestors: [],
            children: []
        };
        this.submitNextLine = this.submitNextLine.bind(this);
        this.renderLineLink = this.renderLineLink.bind(this);
    }

    fetchLine() {
        axios
            .get(`${API_URL}/line`, {
                params: {
                    lineId: this.props.match.params.lineId
                }
            })
            .then(response => {
                this.setState({
                    text: response.data.text,
                    children: response.data.children,
                    ancestors: response.data.ancestors
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

    // Get array of lines in the current limerick
    getCurrentLimerick() {
        const lines = this.state.ancestors.map(ancestor => ancestor.text);
        lines.push(this.state.text);
        return lines;
    }

    async submitNextLine(nextLine) {
        try {
            const response = await axios.post(`${API_URL}/line`, {
                text: nextLine,
                parentId: this.props.match.params.lineId,
                userId
            });
            history.push(`/line/${response.data.lineId}`);
            toast.success("Line submitted successfully!");
        } catch (e) {
            toast.error(e.message || "An error occurred!");
        }
    }

    renderLineLink(line) {
        return (
            <Link key={line._id} className="line-link" to={`/line/${line._id}`}>
                {line.text}
            </Link>
        );
    }

    renderNextLine() {
        if (this.state.ancestors.length === 4) {
            return null;
        }

        return (
            <div className="centered-col">
                <LineInput
                    currentLimerick={this.getCurrentLimerick()}
                    onSubmit={this.submitNextLine}
                />
                {this.state.children.length > 0 ? (
                    <h3> Or select an existing line: </h3>
                ) : null}
                {this.state.children.map(this.renderLineLink)}
            </div>
        );
    }

    render() {
        return (
            <div className="Line centered-col">
                <div className="Line-ancestors">
                    {this.state.ancestors.map(this.renderLineLink)}
                    <span className="line-link no-hover">
                        {this.state.text}
                    </span>
                </div>
                {this.renderNextLine()}
            </div>
        );
    }
}

export default Home;