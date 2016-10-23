"use strict";

import React, { Component } from 'react';
//var Dropzone = require('react-dropzone');
// var LocalStorageMixin = require('react-localstorage');

export default class Upload extends Component {
    constructor(props) {
      super(props)

        this.state = { files: [] }
    }

  //onOpenClick: function () {
  //  this.refs.dropzone.open();
  //},

  render() {
    return (
      <div className="form-media-upload">
        <form className="box" method="post" action="/media_upload" encType="multipart/form-data">
          <div className="box__input">
            <input className="box__file" type="file" name="media" id="file" data-multiple-caption="{count} files selected" multiple />
            <label htmlFor="file"><strong>Choose a file</strong><span className="box__dragndrop"> or drag it here</span>.</label>
            <button className="box__button" type="submit">Upload</button>
          </div>
          <div className="box__uploading">Uploading&hellip;</div>
          <div className="box__success">Done!</div>
          <div className="box__error">Error!</div>
        </form>
      </div>
    )
  }
}
