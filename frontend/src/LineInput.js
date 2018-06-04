import axios from "axios";
import FaCircleO from "react-icons/lib/fa/circle-o";
import FaCheckCircleO from "react-icons/lib/fa/check-circle-o";
import FaTimesCircleO from "react-icons/lib/fa/times-circle-o";
import React, { Component } from "react";
import ReactLoading from "react-loading";
import syllable from "syllable";
import debounce from "throttle-debounce/debounce";
import "./LineInput.css";

// Returns true if word1 and word2 rhyme, false otherwise
async function checkRhyme(word1, word2) {
    // undefined and the empty string don't rhyme with anything
    if ([word1, word2].includes(undefined) || [word1, word2].includes("")) {
        return false;
    }

    // Any word rhymes with itself
    if (word1 === word2) {
        return true;
    }

    const apiUrl = "https://api.datamuse.com/words?";
    const param = "rel_rhy=";
    const result = await axios.get(
        apiUrl + param + word1 + "&" + param + word2
    );
    const matchingWords = result.data;
    return matchingWords.length > 0;
}

// Gets the last word of a line in a poem
const getLastWordOfLine = line => {
    const lineWithoutPunctuation = line.trim().replace(/[.,!;:()?]/g, "");
    const allWords = lineWithoutPunctuation.split(" ");
    return allWords[allWords.length - 1];
};

class LineInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nextLine: "",
            isValidRhyme: false // when loading, this is set to null
        };

        this.editNextLine = this.editNextLine.bind(this);
        this.submitNextLine = this.submitNextLine.bind(this);
        this.debouncedCheckRhyme = debounce(2500, this.debouncedCheckRhyme);
    }

    getPlaceholder() {
        const { currentLimerick } = this.props;
        if (currentLimerick.length === 0) {
            return "Enter the first line of a new limerick...";
        }

        return "Suggest a line that could come next...";
    }

    getWordToRhymeWith() {
        const { currentLimerick } = this.props;
        if (currentLimerick.length === 1 || currentLimerick.length === 4) {
            // This needs to rhyme with the first line
            return getLastWordOfLine(currentLimerick[0]);
        }
        if (currentLimerick.length === 3) {
            // This needs to rhyme with the third line
            return getLastWordOfLine(currentLimerick[2]);
        }

        // This doesn't need to rhyme with anything specific
        return null;
    }

    async debouncedCheckRhyme() {
        const wordToRhymeWith = this.getWordToRhymeWith();
        if (wordToRhymeWith === null) return;

        const lastWord = getLastWordOfLine(this.state.nextLine);
        const isValid = await checkRhyme(lastWord, wordToRhymeWith);

        if (isValid) {
            this.setState({
                isValidRhyme: true
            });
        } else {
            this.setState({
                isValidRhyme: false
            });
        }
    }

    editNextLine(event) {
        this.setState(
            {
                nextLine: event.target.value,
                isValidRhyme: null
            },
            // Check whether the newly entered word is valid once state has been updated
            this.debouncedCheckRhyme
        );
    }

    submitNextLine() {
        // don't submit an empty string as the next line
        if (this.state.nextLine.length === 0) return;

        this.props.onSubmit(this.state.nextLine);
        this.setState({
            nextLine: "",
            isValidRhyme: false
        });
    }

    renderSyllableCount() {
        const { currentLimerick } = this.props;

        const lineNumber = currentLimerick.length + 1;
        const minCount = [1, 2, 5].includes(lineNumber) ? 8 : 5;
        const maxCount = [1, 2, 5].includes(lineNumber) ? 9 : 6;
        const message = `${minCount}-${maxCount} syllables`;

        const syllableCount = syllable(this.state.nextLine);
        if (syllableCount === minCount || syllableCount === maxCount) {
            return (
                <div className="LineInput-check green">
                    <FaCheckCircleO className="LineInput-check-icon" />
                    {message}
                </div>
            );
        }

        return (
            <div className="LineInput-check gray">
                <FaCircleO className="LineInput-check-icon" />
                {message}
            </div>
        );
    }

    renderRhymeCheck() {
        const wordToRhymeWith = this.getWordToRhymeWith();
        if (wordToRhymeWith === null) {
            // No need to rhyme with anything specific
            return null;
        }

        const message = `Rhymes with '${wordToRhymeWith}'`;

        if (this.state.nextLine === "") {
            return (
                <div className="LineInput-check gray">
                    <FaCircleO className="LineInput-check-icon" />
                    {message}
                </div>
            );
        }

        if (this.state.isValidRhyme) {
            return (
                <div className="LineInput-check green">
                    <FaCheckCircleO className="LineInput-check-icon" />
                    {message}
                </div>
            );
        }

        if (this.state.isValidRhyme === null) {
            return (
                <div className="LineInput-check gray">
                    <ReactLoading
                        className="LineInput-loading-spinner"
                        type="spin"
                        color="#777"
                        height={15}
                        width={15}
                    />
                    {message}
                </div>
            );
        }

        return (
            <div className="LineInput-check orange">
                <FaTimesCircleO className="LineInput-check-icon" />
                {message}
            </div>
        );
    }

    render() {
        return (
            <div className="LineInput">
                <div className="LineInput-input-wrapper">
                    <input
                        className="LineInput-input"
                        value={this.state.nextLine}
                        onChange={this.editNextLine}
                        placeholder={this.getPlaceholder()}
                    />
                    <button
                        className="LineInput-submit"
                        onClick={this.submitNextLine}
                    >
                        Submit
                    </button>
                </div>
                {this.renderSyllableCount()}
                {this.renderRhymeCheck()}
            </div>
        );
    }
}

export default LineInput;