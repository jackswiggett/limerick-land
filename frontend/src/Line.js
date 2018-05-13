import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Line.css';
import { API_URL } from './constants';

 async function loadData(url) {
  var result =  await axios.get(url);
  return result.data;
}

//Returns array of current limerick lines
function getCurrentLimerick(state){
  var lines =[];
    for (var x = 0; x < state.ancestors.length;x++){
    lines.push(state.ancestors[x].text);
    }
    lines.push(state.text);
    return lines;
  }

async function handle_cases(split, word, all_rhymes, url, index, poem, nextLine) {
    split = poem[index].split(" ");
    word = split[split.length-1];
    all_rhymes = await loadData(url+word);
    var rhymes_arr = [];
    for (var x = 0; x < all_rhymes.length; x++){
        rhymes_arr.push(all_rhymes[x]['word']);
    }
    console.log(rhymes_arr);
    if (rhymes_arr.indexOf(nextLine) <0)
        return 0;
}

async function rhymeCheck(poem, nextLine){ //returns 0 if word does not rhyme
var url = 'https://api.datamuse.com/words?rel_rhy=';
var all_rhymes;
var word;
var split;

switch (poem.length) {
    case 1:
    case 4:
        if (await handle_cases(split, word,
            all_rhymes, url, 0, poem, nextLine) === 0)
            return 0;
        break;
    case 3:
        if (await handle_cases(split, word,
            all_rhymes, url, 2, poem, nextLine) === 0)
            return 0;
        break;
    default:
    }
    return 1;
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      ancestors: [],
      children: [],
      nextLine: '',
      rhymeWorks: 'Input must follow the rhyme scheme',
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

  async submitNextLine() {
    // don't submit an empty string as the next line
    if (this.state.nextLine.length === 0) return;
    var poem = getCurrentLimerick(this.state);
    var rhymeScore = await rhymeCheck(poem, this.state.nextLine);
    console.log("Answer to the rhyme check: "+rhymeScore);
    if (rhymeScore === 0){
    var check_word = '';
    if (poem.length == 1 || poem.length == 4){
    var split = poem[0].split(" ");
    check_word = split[split.length-1];
    }
    else{
    var split = poem[2].split(" ");
    check_word = split[split.length-1];
    }
     this.setState({
      rhymeWorks: this.state.nextLine+ " does not rhyme with "+check_word,
    });
    return;
    }
    this.setState({
      rhymeWorks: "New Line accepted!",
    });
    
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
      return null;
    }

    return (
      <div>
        <h3>Select the next line:</h3>
        {this.state.children.map(this.renderLineLink)}
        <div className="entry">
        <input
          className="Line-next-line"
          value={this.state.nextLine}
          onChange={this.editNextLine}
          placeholder="Suggest another next line..."
        />
        <button className="submit" onClick={this.submitNextLine}>Submit</button>
        
</div>
<div className="checkBoxHolder">
            {this.state.rhymeWorks}
        </div>
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
