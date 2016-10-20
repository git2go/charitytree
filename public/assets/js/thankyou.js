import React from 'react';
import { Link, History } from 'react-router';
exports.Thankyou = React.createClass({

  handleClick: function () {
    this.props.history.pushState(null, `/dashboard`);
  },

  render: function () {
    return (
      <div className="container center">
        <h4>Thank you so much for your donation!</h4>
        <button className="waves-effect waves-light btn light-blue darken-3" onClick={this.handleClick}>Return To
          Dashboard
        </button>
      </div>
    );
  }
});
