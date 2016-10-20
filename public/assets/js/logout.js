import React from 'react';
import { History } from 'react-router';

const Logout = React.createClass({
  mixins: [ History ],
  componentDidMount() {
    $.ajax({
      type: 'POST',
      url: '/logout_post',
      success: function () {
        feeder.emit('disconnect');
        localStorage.clear();
        this.props.isLoggedIn();
        window.location.href = 'http://localhost:4000';
      }.bind(this),
      error: function (xhr, status, err) {
        console.log("Error posting to: " + xhr, status, err.toString());
      }.bind(this)
    });
  },

  render() {
    return <div></div>
  }
});

export default Logout
