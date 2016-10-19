import React from 'react';
import { Link, History } from 'react-router';

import {Footer} from './footer.js';

exports.Home = React.createClass({
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

  componentDidMount: function () {
    $('.parallax').parallax();
    $(".button-collapse").sideNav();
    localStorage.clear();
  },

  render: function () {
    return (
      <div>

        {/*Parallax*/}
        <div className="parallax-container">
          <div className="parallax">
            <img src="https://c1.staticflickr.com/5/4142/4931601202_92f9bb7152_b.jpg"/>
          </div>
          <div className="caption center-align ">
            <h3 className="shadow-white">See the lives changed by your donation!</h3>
            <h5 className="light grey-text text-lighten-3 shadow">Follow the impact of your money</h5>
            <Link className="waves-effect waves-light btn light-blue darken-3" to="/browse">Browse Categories</Link>
          </div>
        </div>

        <div className="section white">
          <p className="grey-text text-darken-3 lighten-3"/>
          <div className="container">
            <div className="center-align">
              <h4> Search for a cause or Organization </h4>
            </div>
            <div className="center-align col s4">
              <form onSubmit={this.handleSearchSubmit} className="center-align col s4">
                <div className="center-align input-field col s4">
                  <input
                    id="search"
                    type="search"
                    placeholder="Search..."
                    value={this.props.searchText}
                    onChange={this.updateInput}
                    required/>
                  {this.props.searchText ?
                    <i className="material-icons black-text" onClick={this.clearInput}>close</i> : "" }
                </div>
              </form>
            </div>

            <div className="row center-align">

              <h1 className="center-align condensed light"> Make Giving Personal! </h1>

              <div className="col s12 m4">
                <i className="material-icons large center blue-text accent-3">favorite</i>
                <h4 className="condensed light">Find Organizations you can trust!</h4>
                <h6 className="condensed light">Each organization on Charity tree is vetted and required to show you
                  where your money is spent!</h6>
              </div>
              <div className="col s12 m4">
                <i className="material-icons large center blue-text accent-3 condensed light">toc</i>
                <h4 className="condensed light">Be a part of a project!</h4>
                <h6 className="condensed light">Donate to specific needs on projects locally and around the world! </h6>
              </div>
              <div className="col s12 m4">
                <i className="material-icons large center blue-text accent-3 condensed light">supervisor_account</i>
                <h4 className="condensed light">Contribute in a meaningful way!</h4>
                <h6 className="condensed light">See what your donation does through updates, pictures, video,
                  documentation and more! No more wondering if your donation made a real change!</h6>
              </div>

            </div>
          </div>
        </div>

        <div className="parallax-container">
          <div className="parallax">
            <img src="https://c1.staticflickr.com/5/4073/4931587174_a40ebdf2f5_b.jpg"/>
          </div>
          <div className="caption left-align shadow">
            <div className="row">
              <div className="col s5">
                <h3 className="condensed light grey-text text-lighten-3 shadow">Real change, inspiring results!</h3>

                <h5 className="valign left-align light grey-text text-lighten-3 shadow">Be a part of something
                  great</h5>
              </div>
            </div>
          </div>
        </div>

        <div className="section grey lighten-4">
          <p className="grey-text text-darken-3 lighten-3"/>

          <div className="row center-align">
            <h2 className="center-align condensed light"> Featured Projects</h2>
          </div>
          <div className="container">
            <div className="row">
              <div className="col s12 m4 l4">
                <div className="grid">
                  <figure className="effect-sadie">
                    <img className="responsive-img" src="https://c1.staticflickr.com/9/8082/8380083742_098a5616b9_c.jpg"
                         alt="img02"/>
                    <figcaption>
                      <p>Community development in Oman</p>
                      <a>View more</a>
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="col s12 m4 l4">
                <div className="grid">
                  <figure className="effect-sadie">
                    <img className="responsive-img"
                         src="https://c2.staticflickr.com/2/1702/23992532261_b252ff181b_c.jpg"
                         alt="img02"/>
                    <figcaption>
                      {/*<h2>Rooftop <span>Wilshire</span></h2>*/}
                      <p> Help build a new school in Uganda</p>
                      <a>View more</a>
                    </figcaption>
                  </figure>
                </div>
              </div>

              <div className="col s12 m4 l4">
                <div className="grid">
                  <figure className="effect-sadie">
                    <img className="responsive-img"
                         src="https://c1.staticflickr.com/3/2894/10570090394_be3bdc88c2_c.jpg"
                         alt="img02"/>
                    <figcaption>
                      {/*<h2> Standard <span>Hotel</span></h2>*/}
                      <p>Developing food sources in South Sudan<br /></p>
                      <a>View more</a>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="parallax-container">
          <div className="parallax">
            <img src="https://c1.staticflickr.com/5/4116/4931019303_2f386bffb7_b.jpg"/>
          </div>
          <div className="caption bottom center-align">
            <h3 className="condensed light">Know where your money is going!</h3>
            <h5 className="condensed light light grey-text text-lighten-3 shadow">See the impact!</h5>
          </div>
        </div>

        {/*Footer*/}
        <Footer />
      </div>
    );
  }
});
