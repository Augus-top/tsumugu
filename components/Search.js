import React, { Component } from 'react';

export class Search extends Component {
  state = {
    searchValue: ''
  };

  handleChange = (e) => {
    this.setState({
      searchValue: e.target.value.replace(/\s/g, "")
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.submitUser(this.filterInput());
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
  };
  
  filterInput = () => {
    const input = this.state.searchValue;
    if (input.startsWith('https' || 'vndb')) {
      const userID = input.slice(input.indexOf('/u') + 2, input.length);
      return userID.endsWith('/') ? userID.slice(0, input.lastIndexOf('/')) : userID;
    }
    return input === '' ? 'augustop' : input;
  };

  render(){
    return (
      <form onSubmit={this.handleSubmit} className='search' autoComplete='on'>
        <input type='text' placeholder=' https://vndb.org/u32543 or augustop' value={this.state.value} onChange={this.handleChange} />
      </form>
    );
  }
};
