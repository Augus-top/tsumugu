import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import navIcon from './images/nav_icon4.svg'; 


export default class NavBar extends Component {
  render(){
    return (
      <nav className='flex-container navbar' >
        <div>
          <Link to='/'><img src={navIcon} alt='nav Logo'/></Link>
        </div>
        <div>
          <Link to='/'><h1>My Visual Novel List</h1></Link>
        </div>
        <div className='navbar-search'>
          <Search submitUser={this.props.handleSubmit}/>
        </div>
      </nav>
    );
  }
};