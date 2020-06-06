import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap'
import ModalForm from './Components/Modals/Modal'
import DataTable from './Components/Tables/DataTable'
import { CSVLink } from "react-csv"
import { Button } from 'reactstrap';

class App extends Component {
    constructor(props) {
    super(props)
    this.state = {
      items: [],
      pageCounts: [],
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
        }
      })
      .catch(err => console.log(err))
  }

  resetPageCount() {
    document.getElementById('search_pagination').value = '1';
  }

  getFilteredItems() {
    var baseUrl = 'http://0.0.0.0:5001/search?';
    var keyword = document.getElementById('search_keyword').value;
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
          this.setState({items, pageCounts})
        }
      })
      .catch(err => console.log(err))
  }

  addItemToState = (item, pageCounts) => {
    this.setState(prevState => ({
      items: [...prevState.items, item],
      pageCounts: pageCounts
    }));
  }

  updateState = (item) => {
    const itemIndex = this.state.items.findIndex(data => data.id === item.id);
    const items = [
      ...this.state.items.slice(0, itemIndex),
      item,
      ...this.state.items.slice(itemIndex + 1)
    ]
    this.setState({ items });
  }

  deleteItemFromState = (id) => {
    const updatedItems = this.state.items.filter(item => item.id !== id)
    if (updatedItems.length > 0) { this.setState({ items: updatedItems }); }
    else {
      setTimeout(function(){
        document.getElementById('search_pagination').value = 1;
        this.getItems();
      }
      .bind(this),
      2000);
    }
  }

  componentDidMount(){
    this.getItems();
  }

  render() {
    return (
      <Container className="App outer-container">
        <Row>
          <Col>
            <h1 className="app-title">SiteMaps Database</h1>
          </Col>
        </Row>
        <Row>
          <Col className="search-container">
            <input type="text" id="search_keyword" className="search-bar" placeholder="search by name or main url.." onChange= {this.resetPageCount}/>
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
            <DataTable items={this.state.items} updateState={this.updateState} deleteItemFromState={this.deleteItemFromState} />
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