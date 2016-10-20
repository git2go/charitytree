"use strict";
var React = require('react');
var ReactDOM = require('react-dom');
import { History } from 'react-router';

exports.OrgProfile = React.createClass({
  componentWillReceiveProps: function(newProps) {
    this.setState({ orgInfo: newProps.orgInfo, editing: false });
  },

  getInitialState: function() {
    return {
      editing: false,
      orgInfo: {}
    }
  },

  update: function(formData) {
    $.ajax({
      method: 'POST',
      url: '/dashboard/profile',
      data: formData,
      success:function(response) {
        feeder.emit('profile_update', response.results.username);
        this.props.update_db_state_prop({
          'about': response.results.about,
          'areas_of_focus': response.results.areas_of_focus
        });
      }.bind(this),
      error: function(error){
      }
    });
  },

  editPage: function(e) {
    e.preventDefault();
    this.setState({ editing: true });
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var aofs = (ReactDOM.findDOMNode(this.refs.aofs).value).trim();
    if (aofs[aofs.length - 1] === ";") {
      aofs = aofs.slice(0, aofs.length-1);
    }
    aofs = aofs.replace(/;\s*|\r\n|\r|\n/g,"/b$117/").split("/b$117/")
    var formData = {
      about: ReactDOM.findDOMNode(this.refs.about).value,
      areas_of_focus: aofs
    };
    this.update(formData);
  },

  displayMode: function() {
    var orgInfo = Object.keys(this.state.orgInfo).length ? this.state.orgInfo : this.props.orgInfo;
    return (
      <div className="container">
        <h3 className="center">{orgInfo.name}</h3>
          <h6 className="center">{'@'+orgInfo.username}</h6>
          <h5>About</h5>
          <p>{orgInfo.about}</p>
        <h5>Areas of Focus</h5>
          <ul>
            {orgInfo.areas_of_focus.map(function(aof, idx) {
              return (
                <div key={idx}>
                  <li><i className="tiny material-icons">done</i>{aof}</li>
                </div>
              )
            })}
          </ul>
        <a className="waves-effect waves-light btn blue" onClick={this.editPage}>Edit</a>
      </div>
    )
  },

  editMode: function() {
    var orgInfo = Object.keys(this.state.orgInfo).length ? this.state.orgInfo : this.props.orgInfo;
    return (
      <div className="container">
        <h3>{orgInfo.name}</h3>
        <h5>{orgInfo.username}</h5>

        <form id="profileEdit" onSubmit={this.handleSubmit}>
          <div className="row">
            <div className="input-field col s12">
              <textarea id="about" className="materialize-textarea" ref="about" defaultValue={orgInfo.about} required/>
              <label htmlFor="about"></label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12">
              <textarea id="aofs" className="materialize-textarea" ref="aofs" defaultValue={orgInfo.areas_of_focus.join("; ")}/>
              <label htmlFor="aofs"></label>
            </div>
          </div>
          <input type="submit" value="Submit" className="btn blue"/>
        </form>
      </div>
    )
  },

  render: function() {
    return (!this.state.editing) ? this.displayMode() : this.editMode()
  }
});
