import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

class AddEditForm extends React.Component {
  state = {
    id: '',
    name: '',
    main_url: '',
    limit: '',
    scraped_data: {}
  }

  onChange = e => {
    this.setState({[e.target.name]: e.target.value});
  }

  submitFormAdd = e => {
    e.preventDefault()
    fetch('http://0.0.0.0:5001/insert_data', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.name,
        main_url: this.state.main_url,
        limit: this.state.limit
      })
    })
      .then(response => response.json())
      .then(data => {
        var item = data.item;
        var pageCounts = data.pagination_counts;
        if(Array.isArray(item)) {
          this.props.addItemToState(item[0], pageCounts)
          this.props.toggle()
        } else {
          console.log('failure')
        }
      })
      .catch(err => console.log(err))
  }

  submitFormEdit = e => {
    e.preventDefault()
    fetch('http://0.0.0.0:5001/insert_data', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.state.id,
        name: this.state.name,
        main_url: this.state.main_url,
        limit: this.state.limit,
        scraped_data: this.state.scrapedData
      })
    })
      .then(response => response.json())
      .then(item => {
        if(Array.isArray(item)) {
          this.props.updateState(item[0])
          this.props.toggle()
        } else {
          console.log('failure')
        }
      })
      .catch(err => console.log(err))
  }

  componentDidMount(){
    if(this.props.item){
      const { name, main_url, limit, scrapedData, id } = this.props.item
      this.setState({ name, main_url, limit, scrapedData, id })
    }
  }

  render() {
    return (
      <Form onSubmit={this.props.item ? this.submitFormEdit : this.submitFormAdd}>
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input type="text" name="name" id="name" onChange={this.onChange} value={this.state.name === null ? '' : this.state.name} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="main_url">Main URL</Label>
          <Input type="text" name="main_url" id="main_url" onChange={this.onChange} value={this.state.main_url === null ? '' : this.state.main_url}  />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="limit">Limit</Label>
          <Input type="number" name="limit" id="limit" onChange={this.onChange} value={this.state.limit === null ? '' : this.state.limit}/>
        </FormGroup>
        <Button>Submit</Button>
      </Form>
    );
  }
}

export default AddEditForm
