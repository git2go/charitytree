"use strict";
var React = require('react');

import {MediaUpload} from '../media_upload.js'

exports.Media = React.createClass({
  componentWillReceiveProps: function(nextProps) {
    var state = this.state.media;
    for (var prop in nextProps.media) {
      state[prop] = nextProps.media[prop]
    }
    this.setState({ media: state })
  },

  getInitialState: function() {
    return {
      media: {
        profile_img: {},
        images: [],
        videos: []
      }
    }
  },

  componentDidMount: function() {
    $('.materialboxed').materialbox();
  },

  upload_profile_img: function(e) {
    e.preventDefault();
    this.setState({ editing: true });
    var $form = $('.' + e.target.className);
    var formData = new FormData($form.get(0));
    $.ajax({
      method: 'POST',
      url: $form.attr('action'),
      contentType: false,
      cache: false,
      processData: false,
      data: formData,
      success:function(response) {
        this.props.update_db_state_prop({'profile_img': response.results});
      }.bind(this),
      error: function(error){
      }
    });
  },

  profile_img_upload_form: function() {
    return (
      <form
        className="profile_img_frm"
        onSubmit={this.upload_profile_img}
        action="/dashboard/profile_img/upload"
        encType="multipart/form-data"
        accept="image/*">
        {/*<label htmlFor="profile_img">Choose profile image</label>*/}
        <input className="" id="profile_img" type="file" name="profile_img" />
        <input className="btn blue" type="submit" value="Upload Profile Image" />
      </form>
    );
  },

  profile_and_banner_img: function() {
    var profile_img = (this.state.media.profile_img['filename'] === undefined && this.props.media.profile_img === undefined)
      ? "http://previews.123rf.com/images/kritchanut/kritchanut1406/kritchanut140600093/29213195-Male-silhouette-avatar-profile-picture-Stock-Vector-profile.jpg"
      : (this.state.username)
      ? '/dashboard_data/profile_img/'+ this.props.username + '/' + this.state.profile_img.filename
      : '/dashboard_data/profile_img/'+ this.props.username + '/' + this.props.media.profile_img.filename;

    return (
      <div className="row">
        <div className="col s12 center-align">
          <h4>Profile Image</h4>
          <div>
            {this.profile_img_upload_form()}
          </div>
          <img className="materialboxed responsive-img center-image" src={profile_img} />
        </div>
      </div>
    )
  },

  render: function() {
    return (
      <div className="container">
        {this.profile_and_banner_img()}

        <div className="center-align">
          <h4>Pictures</h4>
          <div className="row">
            {this.props.media.images.map(function(file, idx) {
              return (
                <div key={idx} className="col s12 m6 l4">
                  <img className="materialboxed responsive-img" src={'/dashboard_data/org/media/'+file} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="center-align">
          <h4>Videos</h4>
          <div className="row">
          {this.props.media.videos.map(function(file, idx) {
            return (
              <div key={idx} className="col s12 m6 l4">
                <video className="responsive-video" controls >
                  <source src={'/dashboard_data/org/media/'+file}/>
                </video>
              </div>
            );
          })}
          </div>
        </div>

        <div className="row center-align">
          <h4>Upload Picture or Video</h4>
          <MediaUpload
            action={"/dashboard/org/media/upload"}
            update_db_state_prop={this.props.update_db_state_prop}
          />
        </div>
      </div>
    )
  }
});
