import React, { Component } from 'react'
import { Button } from 'reactstrap';
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import ModalForm from '../Modals/Modal';
import down_arrow  from "./down_arrow.svg";
import up_arrow  from "./up_arrow.svg";


class DataTable extends Component {
  constructor(props) {
    super(props)
    this.deleteItem = this.deleteItem.bind(this)
    this.renderCard = this.renderCard.bind(this)
    this.renderEmpty = this.renderEmpty.bind(this)
  }

  deleteItem(id){
    let confirmDelete = window.confirm('Delete item forever?')
    if(confirmDelete) {
      fetch('http://0.0.0.0:5001/delete_data', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
         id
        })
      })
      .then(response => response.json())
      .then(item => {
        this.props.deleteItemFromState(id)
      })
      .catch(err => console.log(err))
    }
  }

  renderCard(item, index) {
    var arrowImgSrc = down_arrow;
    if (this.props.showScrapedData[index]) {
      arrowImgSrc = up_arrow;
    }
    return (
      <Card key={item.id} className={"inner-card"}>
        <Card.Body>
          <Card.Title>
            {item.name}
            <div className={"row edit-del-action-container"}>
              <ModalForm buttonLabel="Edit" item={item} updateState={this.props.updateState}/>
              <Button color="danger" onClick={() => this.deleteItem(item.id)}>Delete</Button>
            </div>
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">Main URL: {item.main_url}</Card.Subtitle>
          <Card.Subtitle className="mb-2 text-muted">Limit: {item.limit}</Card.Subtitle>
          <br/>
          <Card.Subtitle className="mb-2 text-muted">
            Scraped Data:
            <img src={arrowImgSrc} alt={""} height="20px" width="20px"
              onClick={this.props.toggleShowScrapedData.bind(this, index)}
              className={"toggle-arrow"}
            />
          </Card.Subtitle>
          {
            this.props.showScrapedData[index] ? (
              <ListGroup variant="flush">
                {
                  item.scraped_data.length > 0 ? (
                    item.scraped_data.map((_data) => {
                      return (
                        <ListGroup.Item key={_data.web_page}>
                          <div className={"scraped-data-inner-container"}>
                            <label> URL: </label> <span>{ _data.web_page }</span> <br/>
                            <label> OG Image: </label> <span>{ _data.og_image }</span> <br/>
                            <label> OG Title: </label> <span>{ _data.og_title }</span> <br/>
                            <label> OG Description: </label> <span>{ _data.og_description }</span> <br/>
                          </div>
                        </ListGroup.Item>
                      )
                    })
                  ) : (<label>Could not find any urls which have "noopener" in their rel.</label>)
                }
              </ListGroup>
            ) : (null)
          }
          </Card.Body>
        </Card>
       )
  }
  renderEmpty(){
    return (
      <Card>
         <Card.Body className={"empty-container-card"}>
           <Card.Title>No Items Found!</Card.Title>
           <Card.Subtitle className="mb-2 text-muted">Add items (OR) Search for a different keyword!</Card.Subtitle>
         </Card.Body>
       </Card>
    )
  }

  render() {
    return (
      <div>
        { this.props.items.length > 0? ( this.props.items.map((item, index) => this.renderCard(item, index) ) ) : ( this.renderEmpty() ) }
      </div>
    )
  }
}

export default DataTable
