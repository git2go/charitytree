"use strict";
var React = require('react');
import { History } from 'react-router';
import moment from 'moment';
moment().format();

exports.OrgFeed = React.createClass({
  getInitialState: function () {
    return {
      feedContent: feedData
    }
  },

  render: function () {
    var feedContent = (this.state.feedContent.length)
      ? this.state.feedContent
      : this.props.feed;
    return (
      <div className="container center-align">
        <h3>Feed</h3>
        <div className="row">
          {feedContent.map(function (item, idx) {
            var attachment = '';
            if (item.attachment_type === 'image') {
              attachment = <img className="materialboxed responsive-img" src={item.attachment}/>;
            } else if (item.attachment_type === 'video') {
              attachment = <video className="responsive-video" src={item.attachment} controls/>;
            }

            return (
              <div className="col s12 l6" key={idx}>
                <ul className="collection with-header left-align">
                  <li className="collection-header">
                    <div className="row">
                      <div className="col s8">
                        <h4>{item.user === this.props.user ? "You" : item.user}</h4>
                      </div>
                      <div className="col s4">
                        <p><strong>{moment(item.created_date).format('MMM D, YYYY')}</strong><br/><strong>{moment(item.created_date).format('hh:mm A')}</strong></p>
                      </div>
                      <div className="col s12">
                        <p>{item.message}</p>
                      </div>
                    </div>
                  </li>
                  {attachment
                    ? <li className="collection-item"><div>{attachment}</div></li>
                    : ''}
                </ul>
              </div>
            )
          }.bind(this))}
        </div>
      </div>
    )
  }
});
