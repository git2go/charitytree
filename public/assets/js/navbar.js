var React = require('react');
import { Link, History } from 'react-router';

import { Login } from './login.js';
import { Signup } from './signup.js';

exports.Navbar = React.createClass({
  updateInput: function (e) {
    this.props.updateInput(e.target.value);
  },

  clearInput: function () {
    this.props.updateInput("");
  },

  handleSearchSubmit: function (e) {
    e.preventDefault();
    this.props.handleSearchSubmit();
  },

  logout: function () {
    $.ajax({
      type: 'POST',
      url: '/logout_post',
      success: function () {
        feeder.emit('disconnect');
        localStorage.clear();
        window.location.href = 'http://localhost:4000';
      }.bind(this),
      error: function (xhr, status, err) {
        console.log("Error posting to: " + xhr, status, err.toString());
      }.bind(this)
    });
  },

  render: function () {
    return (
      <div>
        <div className="navbar-fixed">

          {/*Dashboard Dropdown*/}
          {this.props.loggedIn ? (
            <ul id="dropdown1" className="dropdown-content">
              <li className="divider"/>
              <li>
                <a className="waves-effect waves-light black-text" onClick={this.logout}>Logout</a>
              </li>
            </ul>
          ) : "" }
          {this.props.loggedIn ? (
            <ul id="dropdown2" className="dropdown-content">
              <li className="divider"/>
              <li>
                <a className="waves-effect waves-light black-text" onClick={this.logout}>Logout</a>
              </li>
            </ul>
          ) : "" }

          <nav>
            <div className="nav-wrapper grey lighten-5">
              <Link to="/" className="brand-logo blue-text thin accent-3" ><img className="navLogo" src="https://c2.staticflickr.com/6/5697/23990114051_04ab0c6e33_b.jpg" /></Link>
              <a href="#" data-activates="mobile-demo" className="button-collapse black-text"><i className="material-icons">menu</i></a>

              {/*Navigation*/}
              <ul className="right hide-on-med-and-down">

                 {/*Search Bar*/}
                <li>
                  <form onSubmit={this.handleSearchSubmit}>
                    <div className="input-field black-text nav-search">
                    <input
                        id="search"
                        type="search"
                        placeholder="Search..."
                        value={this.props.searchText}
                        onChange={this.updateInput}
                        required />
                      <label htmlFor="search" ><i className="material-icons black-text" >search</i></label>
                      {this.props.searchText ? <i className="material-icons black-text" onClick={this.clearInput}>close</i> : "" }
                    </div>
                  </form>
                </li>

                {/*Browse Categories*/}
                <li>
                  <Link className="waves-effect waves-light black-text" to="/browse">Browse Categories</Link>
                </li>

                {/*Login/Signup or Dashboard Dropdown*/}
                {this.props.loggedIn ? (
                  <li>
                    <Link className="dropdown-button black-text" data-activates="dropdown1" to="/dashboard">Dashboard<i className="material-icons black-text right">arrow_drop_down</i></Link>
                  </li>
                ) : (
                  <li>
                    <Link className="waves-effect waves-light black-text" to="/login">Login/Signup</Link>
                  </li>
                )}
              </ul>

              {/*Side Navigation*/}
              <ul className="side-nav" id="mobile-demo">
                {/*Search Bar*/}
                <li className="search">
                  <form onSubmit={this.handleSearchSubmit}>
                    <div className="search-wrapper card input-field black-text">
                      <input
                        id="search"
                        type="search"
                        value={this.props.searchText}
                        onChange={this.updateInput}
                        required />
                      {this.props.searchText ? <i className="material-icons black-text" onClick={this.clearInput}>close</i> : <i className="material-icons black-text" >search</i>}
                    </div>
                  </form>
                </li>

                {/*Browse Categories*/}
                <li>
                  <Link className="waves-effect waves-light" to="/browse">Browse Categories</Link>
                </li>

                {/*Login/Signup or Dashboard Dropdown*/}
                {this.props.loggedIn ? (
                  <li>
                    <Link className="dropdown-button black-text" data-activates="dropdown2" to="/dashboard">Dashboard<i className="material-icons black-text right">arrow_drop_down</i></Link>
                  </li>
                ) : (
                  <li>
                    <Link className="waves-effect waves-light black-text" to="/login">Login/Signup</Link>
                  </li>
                )}
              </ul>

            </div>
          </nav>
        </div>
      </div>
    );
  }
});
