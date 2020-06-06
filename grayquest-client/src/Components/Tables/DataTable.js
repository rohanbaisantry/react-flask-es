import React, { Component } from 'react'
import { Table, Button } from 'reactstrap';
import ModalForm from '../Modals/Modal';

class DataTable extends Component {

  deleteItem = id => {
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

  render() {

    const items = this.props.items.map(item => {
      return (
        <tr key={item.id}>
          <th scope="row">
            {item.name}
            <div className="row-actions-container" style={{width:"110px"}}>
              <ModalForm buttonLabel="Edit" item={item} updateState={this.props.updateState}/>
              {' '}
              <Button color="danger" onClick={() => this.deleteItem(item.id)}>Del</Button>
            </div>
          </th>
          <td>{item.main_url}</td>
          <td>{item.limit}</td>
          <td>{
            item.scraped_data.map(_data => {
              return (
                <div key={_data.web_page}>
                  <label> web_page: </label>
                  <span>{ _data.web_page }</span>
                  <br/>
                  <label> og_image: </label>
                  <span>{ _data.og_image }</span>
                  <br/>
                  <label> og_title: </label>
                  <span>{ _data.og_title }</span>
                  <br/>
                  <label> og_description: </label>
                  <span>{ _data.og_description }</span>
                </div>
              )
            })}</td>
        </tr>
        )
      })

    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Main URL</th>
            <th>Limit</th>
            <th>Scraped Data</th>
          </tr>
        </thead>
        <tbody>
          {items}
        </tbody>
      </Table>
    )
  }
}

export default DataTable
