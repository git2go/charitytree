"use strict";
var React = require('react');

exports.Endorsement = React.createClass({
  render: function() {
    return (
      <ul>
        {this.props.endorsements.map(function(endorsement, idx) {
          return (
            <li key={idx}>
              <p>{'Title: ' + endorsement.title}</p>
              <p>{'Review: ' + endorsement.review}</p>
              <p>{'Date: ' + endorsement.review_date}</p>
            </li>
          )
        }.bind(this))}
      </ul>
    )
  }
});
