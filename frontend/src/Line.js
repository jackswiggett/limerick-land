import axios from "axios";
import React, { Component } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./Line.css";
import { API_URL } from "./constants";

// Loads data from the API for rhyme checking
async function loadData(url) {
    var result = await axios.get(url);
    return result.data;
}

// Gets the last word of a line in a poem
const getLastWordOfLine = line => {
    const lineWithoutPunctuation = line.replace(/[.,!;:()?]/g, "");
    const allWords = lineWithoutPunctuation.split(" ");
    return allWords[allWords.length - 1];
};

// Throws an error if word1 and word2 do not rhyme
async function checkRhyme(word1, word2) {
    const apiUrl = "https://api.datamuse.com/words?";
    const param = "rel_rhy=";
    const matchingWords = await loadData(
        apiUrl + param + word1 + "&" + param + word2
    );
    if (matchingWords.length === 0) {
        throw new Error(`'${word1}' does not rhyme with '${word2}'`);
    }
}

// Throws an error if the word does not fit in the rhyme scheme
async function validateNextLine(poem, nextLine) {
    const lastWord = getLastWordOfLine(nextLine);

    if (poem.length === 1 || poem.length === 4) {
        // last word must rhyme with the first line
        await checkRhyme(lastWord, getLastWordOfLine(poem[0]));
    } else if (poem.length === 3) {
        // last word must rhyme with third line
        await checkRhyme(lastWord, getLastWordOfLine(poem[2]));
    }
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            ancestors: [],
            children: [],
            nextLine: ""
        };

        this.editNextLine = this.editNextLine.bind(this);
        this.submitNextLine = this.submitNextLine.bind(this);
        this.renderLineLink = this.renderLineLink.bind(this);
    }

    fetchLine() {
        axios
            .get(`${API_URL}/line`, {
                params: { lineId: this.props.match.params.lineId }
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

    editNextLine(event) {
        this.setState({
            nextLine: event.target.value
        });
    }

    // Get array of lines in the current limerick
    getCurrentLimerick() {
        const lines = this.state.ancestors.map(ancestor => ancestor.text);
        lines.push(this.state.text);
        return lines;
    }

    async submitNextLine() {
        // don't submit an empty string as the next line
        if (this.state.nextLine.length === 0) return;

        var poem = this.getCurrentLimerick();
        try {
            await validateNextLine(poem, this.state.nextLine);
            axios
                .post(`${API_URL}/line`, {
                    text: this.state.nextLine,
                    parentId: this.props.match.params.lineId
                })
                .then(() => {
                    this.setState({
                        nextLine: ""
                    });
                    this.fetchLine();
                    toast.success("Line submitted successfully!");
                });
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
            <div>
                {this.state.children.length > 0 ? (
                    <h3>Select the next line:</h3>
                ) : null}
                {this.state.children.map(this.renderLineLink)}
                <div className="entry">
                    <input
                        className="Line-next-line"
                        value={this.state.nextLine}
                        onChange={this.editNextLine}
                        placeholder="Suggest a line that could come next..."
                    />
                    <button className="submit" onClick={this.submitNextLine}>
                        Submit
                    </button>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="Line">
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