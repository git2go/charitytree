"use strict";
var React = require('react');
import { History } from 'react-router';
import { Signup } from './signup.js';

exports.Login = React.createClass({
  getInitialState: function () {
    return {
      username: '',
      pwd: '',
      errorMsg: ''
    }
  },

  navigateToDashboard: function () {
    this.props.history.pushState(null, `/dashboard`);
  },

  usernameChange: function (e) {
    this.setState({username: e.target.value});
  },

  pwdChange: function (e) {
    this.setState({pwd: e.target.value});
  },

  login: function (e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/login_post',
      data: this.state,
      success: function(response) {
        // console.log(response);
        localStorage.token = response.token;
        // feeder.emit('getFeed', response.token)
        this.props.isLoggedIn();
        this.navigateToDashboard();
      }.bind(this),
      error: function(xhr, status, response) {
        if (xhr.status === 401) {
          this.setState({ errorMsg: "Invalid username/password combination" });
        }
        if (xhr.status === 500) {
          this.setState({ errorMsg: "Login Error. Please try again later." });
        }
      }.bind(this)
    });
  },

  render: function () {
    return (
      <div className="container">
        <br />
        <div className="container">
          <h5 className="thin">“As an organization when my donors see the end results of what their money did, it only encourages more giving, and more gets done - Charity Tree makes that easy for us!” -non-profit</h5>
        </div>
        <br />
        <br />
        <div className="row">

          <div className="col s12 m6">
            <fieldset className="center-align">
              <header><h3 className="condensed light">Login</h3></header>
              <hr/>
              <form id="loginForm" onSubmit={this.login}>
                <div className="input-field">
                  <label htmlFor="username">Username</label>
                  <input type="text" id="username" name="username" required onChange={this.usernameChange}/>
                </div>
                <div className="input-field">
                  <label htmlFor="pwd">Password</label>
                  <input type="password" id="pwd" name="pwd" required onChange={this.pwdChange}/>
                </div>
                <button className="waves-effect waves-light btn blue" type="submit">Submit</button>
                {this.state.errorMsg ? <p className="login-error" style={loginError}>{this.state.errorMsg}</p> : ''}
              </form>
            </fieldset>
          </div>

          <div className="col s12 m6">
            <fieldset className="center-align">
              <header><h3 className="condensed light">Signup</h3></header>
              <hr/>
              <div>
                <h5 className="condensed light">Which would you like to sign up as?</h5>
                <div className="row">
                  <div className="userType">
                    <button className="waves-effect waves-light btn blue" value="Organization"
                            onClick={this.props.setUserType} style={{margin: '20px'}}>Organization
                    </button>
                    <button className="waves-effect waves-light btn blue" value="Donor" onClick={this.props.setUserType}
                            style={{margin: '20px'}}>Donor
                    </button>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

        </div>
      </div>
    )
  }
});

/* Inline Styles */
var loginError = {
  textAlign: 'center',
  fontWeight: 'bold',
  color: 'red'
}
