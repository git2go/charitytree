import React from 'react';
import { History } from 'react-router';
var LocalStorageMixin = require('react-localstorage');

exports.TagContainer = React.createClass({
  displayName: 'TagContainer',
  mixins: [ History, LocalStorageMixin ],
  render: function () {
    var tagNodes;
    if (this.props.searchCriteria.length > 0) {
      tagNodes = this.props.searchCriteria.map(function(tag, idx) {
        return (
          <Tag
            text={ tag }
            removeBrowseTag={ this.props.removeBrowseTag }
            removeSearchTag={ this.props.removeSearchTag }
            key={idx}
          />
        );
      }.bind(this));
    }
    return (
      <div className="taglist">
        { tagNodes ? tagNodes : ""}
      </div>
    );
  }
});

var Tag = exports.Tag = React.createClass({
  removeTag: function(e) {
    if (window.location.pathname === "/browse") {
      this.props.removeBrowseTag(e.target.textContent);
    } else if (window.location.pathname === "/search") {
      this.props.removeSearchTag(e.target.textContent);
    }
  },

  render: function () {
    return(
      <div
        className="chipx hoverable tag-hand"
        textContent={this.props.text}
        onClick={this.removeTag}
      ><i className="fa fa-close" />{this.props.text}
      </div>
    );
  }
});
