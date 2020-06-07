import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap'
import ModalForm from './Components/Modals/Modal'
import DataTable from './Components/Tables/DataTable'
import { CSVLink } from "react-csv"
import { Button } from 'reactstrap';
import Autosuggest from 'react-autosuggest';

class App extends Component {
    constructor(props) {
    super(props)
    this.state = {
      items: [],
      pageCounts: [],
      showScrapedData: [],
      suggestions: [],
      value: '',
      autoSuggestionsList: []
    }
    this.getFilteredItems = this.getFilteredItems.bind(this)
    this.resetPageCount = this.resetPageCount.bind(this)
  }

  getItems(){
    fetch('http://0.0.0.0:5001/list_items')
      .then(response => response.json())
      .then(data => {
        var items = data.items;
        var pageCounts = data.pagination_counts;
        if(Array.isArray(items)) {
          this.setState({items, pageCounts})
          this.setShowScrapedDataList();
          this.setAutoSuggestionsList();
        }
      })
      .catch(err => console.log(err))
  }

  resetPageCount() {
    document.getElementById('search_pagination').value = 1;
  }

  setShowScrapedDataList(){
    var showScrapedData = new Array(this.state.items.length).fill(false);
    this.setState({ showScrapedData })
  }

  setAutoSuggestionsList(){
    var autoSuggestionsList = [];
    for(var i=0; i< this.state.items.length; i ++) {
      autoSuggestionsList.push({
        name: this.state.items[i].name
      })
      autoSuggestionsList.push({
        name: this.state.items[i].main_url
      })
    }
    this.setState({ autoSuggestionsList })
  }

  toggleShowScrapedData(index){
    var showScrapedData = this.state.showScrapedData;
    showScrapedData[index] = !showScrapedData[index];
    this.setState({ showScrapedData });
  }

  getFilteredItems() {
    var baseUrl = 'http://0.0.0.0:5001/search?';
    var keyword = this.state.value;
    if (keyword.length > 0) { baseUrl += "keyword=" + keyword}
    var pageCount = document.getElementById('search_pagination').value;
    if(keyword) { baseUrl += "&"; }
    baseUrl += "page=" + pageCount;
    fetch(baseUrl)
      .then(response => response.json())
      .then(data => {
        var items = data.items;
        var pageCounts = data.pagination_counts;
        if(Array.isArray(items)) {
          this.setState({items, pageCounts});
          this.setShowScrapedDataList();
          this.setAutoSuggestionsList();
        }
      })
      .catch(err => console.log(err))
  }

  addItemToState = (item, pageCounts) => {
    this.setState(prevState => ({
      items: [...prevState.items, item],
      pageCounts: pageCounts
    }));
    this.setShowScrapedDataList();
    this.setAutoSuggestionsList();
  }

  updateState = (item) => {
    const itemIndex = this.state.items.findIndex(data => data.id === item.id);
    const items = [
      ...this.state.items.slice(0, itemIndex),
      item,
      ...this.state.items.slice(itemIndex + 1)
    ]
    this.setState({ items });
    this.setAutoSuggestionsList();
  }

  deleteItemFromState = (id) => {
    const updatedItems = this.state.items.filter(item => item.id !== id)
    if (updatedItems.length > 0) { this.setState({ items: updatedItems }); }
    else {
      setTimeout(function(){
        document.getElementById('search_pagination').value = 1;
        this.setState({value: ''})
        this.getItems();
        this.setAutoSuggestionsList();
      }
      .bind(this),
      2000);
    }
  }

  componentDidMount(){
    this.getItems();
  }

  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.state.autoSuggestionsList.filter(autoSuggestion =>
      autoSuggestion.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  getSuggestionValue(suggestion) { return suggestion.name };

  renderSuggestion(suggestion) {
    return (
      <div className="suggestion-text">
        {suggestion.name}
      </div>
    )
  };

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };


  render() {
    var inputProps = {
      placeholder: 'search by name or main url..',
      value: this.state.value,
      onChange: this.onChange
    };
    return (
      <Container className="App outer-container">
        <Row>
          <Col>
            <h1 className="app-title">SiteMaps Database</h1>
          </Col>
        </Row>
        <Row>
          <Col className="search-container">
            <Autosuggest
              suggestions={this.state.suggestions}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={this.getSuggestionValue}
              renderSuggestion={this.renderSuggestion}
              inputProps={inputProps}
            />
            <div className="search-inner-container">
              <label htmlFor="search_pagination"> Page: </label>
              <select id="search_pagination" className="search-select" name="search_pagination">
                { this.state.pageCounts.map((p) => { return (<option className="search-filter-option" value={p} key={p}>{p}</option>) }) }
              </select>
            </div>
            <Button onClick={this.getFilteredItems}>
              Search
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <DataTable
              items={this.state.items}
              updateState={this.updateState}
              deleteItemFromState={this.deleteItemFromState}
              showScrapedData={this.state.showScrapedData}
              toggleShowScrapedData={this.toggleShowScrapedData.bind(this)}
            />
          </Col>
        </Row>
        <Row className="action-buttons-bottom-row">
          <Col>
            <CSVLink
              filename={"sitemap.csv"}
              color="primary"
              style={{float: "left", marginRight: "10px"}}
              className="btn btn-primary"
              data={this.state.items}>
              Download CSV
            </CSVLink>
            <ModalForm buttonLabel="Add Item" addItemToState={this.addItemToState}/>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default App