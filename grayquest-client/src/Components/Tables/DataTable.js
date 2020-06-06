import React, { Component } from 'react'
import { Button } from 'reactstrap';
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import ModalForm from '../Modals/Modal';

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

  renderCard(item) {
    return (
      <Card key={item.id}>
        <Card.Body>
          <Card.Title>
            {item.name}
            <div className={"row edit-del-action-container"}>
              <ModalForm buttonLabel="Edit" item={item} updateState={this.props.updateState}/>
              <Button color="danger" onClick={() => this.deleteItem(item.id)}>Delete</Button>
            </div>
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">Main URL: {item.main_url}</Card.Subtitle>
          <Card.Subtitle className="mb-2 text-muted">Limit: {item.main_url}</Card.Subtitle>
          <br/>
          <Card.Subtitle className="mb-2 text-muted">Scraped Data:</Card.Subtitle>
          <ListGroup variant="flush">
          <ListGroup.Item />
            {
              item.scraped_data.map((_data) => {
                return (
                  <ListGroup.Item key={_data.web_page}>
                    <div>
                      <label> web_page: </label> <span>{ _data.web_page }</span> <br/>
                      <label> og_image: </label> <span>{ _data.og_image }</span> <br/>
                      <label> og_title: </label> <span>{ _data.og_title }</span> <br/>
                      <label> og_description: </label> <span>{ _data.og_description }</span>
                    </div>
                  </ListGroup.Item>
                )
              })
            }
          </ListGroup>
          </Card.Body>
        </Card>
       )
  }
  renderEmpty(){
    return (
      <Card>
         <Card.Body className={"empty-container-card"}>
           <Card.Title>No Items Found!</Card.Title>
           <Card.Subtitle className="mb-2 text-muted">Add or search for a different keyword!</Card.Subtitle>
         </Card.Body>
       </Card>
    )
  }

  render() {
    return (
      <div>
        { this.props.items.length > 0? ( this.props.items.map((item) => this.renderCard(item) ) ) : ( this.renderEmpty() ) }
      </div>
    )
  }
}

export default DataTable
