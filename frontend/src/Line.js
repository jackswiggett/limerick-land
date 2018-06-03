import axios from "axios";
import React, { Component } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import syllable from "syllable";
import "./Line.css";
import { API_URL } from "./constants";
import { validateLines, userId } from "./userInfo";
import ReactLoading from "react-loading";
import { Section, Title, Article, Prop, list } from "./generic";

var throttle = require("throttle-debounce/throttle");

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
    console.log(matchingWords);
    if (matchingWords.length === 0) {
        // throw new Error(`'${word1}' does not rhyme with '${word2}'`);
        return 0;
    }
    return 1;
}

// Throws an error if the word does not fit in the rhyme scheme
async function validateNextLine(poem, nextLine) {
    if (!validateLines) {
        // nothing to be done
        return;
    }

    const lastWord = getLastWordOfLine(nextLine);

    if (poem.length === 1 || poem.length === 4) {
        // last word must rhyme with the first line
        await checkRhyme(lastWord, getLastWordOfLine(poem[0]));
    } else if (poem.length === 3) {
        // last word must rhyme with third line
        await checkRhyme(lastWord, getLastWordOfLine(poem[2]));
    }
}

async function throttleRhymeCheck(val, poem) {
    const lastWord = getLastWordOfLine(val);
    var x = -1;
    if (poem.length === 1 || poem.length === 4) {
        // last word must rhyme with the first line
        x = await checkRhyme(lastWord, getLastWordOfLine(poem[0]));
    } else if (poem.length === 3) {
        // last word must rhyme with third line
        x = await checkRhyme(lastWord, getLastWordOfLine(poem[2]));
    }
    return x;
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            ancestors: [],
            children: [],
            nextLine: "",
            isRhyming: "",
            loadingType: "blank"
        };
        this.method = throttle(5000, this.method);
        this.editNextLine = this.editNextLine.bind(this);
        this.submitNextLine = this.submitNextLine.bind(this);
        this.renderLineLink = this.renderLineLink.bind(this);
    }

    async method(val) {
        var poem = this.getCurrentLimerick();
        var lastWord = "";
        if (poem.length === 1 || poem.length === 4) {
            lastWord = getLastWordOfLine(poem[0]);
        } else if (poem.length === 3) {
            lastWord = getLastWordOfLine(poem[2]);
        }

        var x = await throttleRhymeCheck(val, poem);
        var response = "";
        if (x === 0) {
            response =
                getLastWordOfLine(val) + " does not rhyme with " + lastWord;
        } else {
            response = getLastWordOfLine(val) + " rhymes with " + lastWord;
        }
        this.setState({
            isRhyming: response,
            loadingType: "blank"
        });
    }

    fetchLine() {
        axios
            .get(`${API_URL}/line`, {
                params: {
                    lineId: this.props.match.params.lineId,
                    validateLines
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

    async editNextLine(event) {
        this.setState({
            nextLine: event.target.value,
            loadingType: "spin"
        });
        await this.method(event.target.value);
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
                    parentId: this.props.match.params.lineId,
                    userId,
                    validateLines
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

        const syllableCount = syllable(this.state.nextLine);
        const poem = this.getCurrentLimerick();
        let minSyll, maxSyll;
        if (poem.length === 0 || poem.length === 1 || poem.length === 4) {
            minSyll = 8;
            maxSyll = 9;
        } else {
            minSyll = 5;
            maxSyll = 6;
        }

        return (
            <div>
                {this.state.children.length > 0 ? (
                    <h3> Select the next line: </h3>
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
                <div
                    className={
                        syllableCount === minSyll || syllableCount === maxSyll
                            ? "syllable-count green"
                            : "syllable-count black"
                    }
                >
                    {this.state.nextLine.length > 0
                        ? `Syllable Count: ${syllableCount}`
                        : ""}
                </div>
                <div className="rhyming">
                    <Section>
                        <Article key={this.state.loadingType}>
                            <ReactLoading
                                type={this.state.loadingType}
                                color="#000"
                                height={25}
                                width={25}
                            />
                        </Article>
                        {this.state.isRhyming}
                    </Section>
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