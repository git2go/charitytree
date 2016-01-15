"use strict";
import React from 'react';
import { History } from 'react-router';
var LocalStorageMixin = require('react-localstorage');
import moment from 'moment';
moment().format();

var Organization = exports.Organization = React.createClass({
  displayName: 'Organization',
  mixins: [ History, LocalStorageMixin ],

  handleClick: function(project){
    localStorage.setItem('currProjObj', project._id);
    this.props.navigateToProjectPage();
  },

  getInitialState: function(){
    return {
      org: null,
      following: false,
      followError: ''
    };
  },

  componentDidMount: function() {
    $.ajax({
        url:'/organization_get/' + localStorage.currentOrganization,
        method: "GET",
        success: function (data) {
          this.setState({
            org: data.results,
            followError: ''
          });

          //Initialize Materialize Components
          $('.materialboxed').materialbox();
          $('.tooltipped').tooltip({delay: 50});
          $('.scrollspy').scrollSpy();

        }.bind(this),
        error: function (xhr, status, err) {
          if (xhr.status === 400) {
            this.props.history.pushState(null, `/search`);
          }
          if (xhr.status === 500) {
            this.setState({ errorMsg: "Error. Please try again later." });
          }
          console.error(xhr, status, err.toString());
        }.bind(this)
      });
  },

  followOrg: function(e) {
    e.preventDefault();
    var org = this.state.org._id || this.props.currentOrganization._id;
    $.ajax({
      method: 'POST',
      url: '/organization/follow/' + org,
      success: function(response) {
        this.setState({ following: true });
      }.bind(this),
      error: function(xhr, status, err) {
        if (xhr.status === 401) {
          this.setState({ followError: "Please log in" });
        }
        if (xhr.status === 500) {
          this.setState({ followError: "Error. Please try again later." });
        }
      }.bind(this)
    });
  },

  render: function () {
    if(this.state.org){
      var today = new Date();
      var profileImg = (this.state.org.profile_img.filename)
      ? "http://localhost:4000/organization/profile_img/" + this.state.org._id
      : "http://worldofgoodethiopia.org/yahoo_site_admin/assets/images/30050052.182123348_std.jpg";

      var secondImg = (this.state.org.images.length)
      ? "http://localhost:4000/dashboard_data/org/media/" + this.state.org.images[0]
      : "http://worldofgoodethiopia.org/yahoo_site_admin/assets/images/30050052.182123348_std.jpg";

      var aofs = this.state.org.areas_of_focus.map(function (aof, index) {
        return (
          <div key={index} className="chip">
            <h6>{aof}</h6>
          </div>
        );
      }.bind(this));

      var currentProjects = this.state.org.projects.filter(function (project) {
        return moment(project.end_date).diff(today) > 0;
      }).map(function (project, index) {
          var projectImg = (project.images.length)
            ? "/dashboard_data/project/media/" + project.images[0]
            : "http://worldofgoodethiopia.org/yahoo_site_admin/assets/images/30050052.182123348_std.jpg";

        return (
          <a className="collection-item avatar black-text" key={index} onClick={this.handleClick} style={{cursor: "pointer"}}>
            <img src={projectImg ? projectImg : "https://c2.staticflickr.com/6/5739/24077966285_c5f0d47dcf_n.jpg"} className="circlex"/>
            <span className="title"><h5>{project.title}</h5></span>
            <div className="line-clamp line-clamp-3 container">{project.info}</div>

            <div className="row">
              <div className="col s6 space-above">
                <p><strong>Start Date:</strong></p><br/><p>{moment(project.start_date).format('MMMM D, YYYY')}</p></div>
              <div className="col s6 space-above">
                <p><strong>End Date:</strong></p><br/><p>{moment(project.end_date).format('MMMM D, YYYY')}</p></div>
            </div>
          </a>
        );
      }.bind(this));

      var pastProjects = this.state.org.projects.filter(function (project) {
        return moment(project.end_date).diff(today) < 0;
      }).map(function (project, index) {
        var projectImg = (project.images.length)
          ? "dashboard_data/project/media/" + project.images[0]
          : "http://worldofgoodethiopia.org/yahoo_site_admin/assets/images/30050052.182123348_std.jpg";
        return (
          <a className="collection-item avatar black-text" key={index} onClick={this.handleClick} style={{cursor: "pointer"}}>
            <img src={projectImg ? projectImg : "https://c2.staticflickr.com/6/5739/24077966285_c5f0d47dcf_n.jpg"} className="circlex"/>
            <span className="title"><h5>{project.title}</h5></span>
            <div className="line-clamp line-clamp-3">{project.info}</div>
            <div className="row">
              <div className="col s6 space-above">
                <p><strong>Start Date:</strong></p><br/><p>{moment(project.start_date).format('MMMM D, YYYY')}</p></div>
              <div className="col s6 space-above">
                <p><strong>End Date:</strong></p><br/><p>{moment(project.end_date).format('MMMM D, YYYY')}</p></div>
            </div>
          </a>
        );
      }.bind(this));

      var endorsements = this.state.org.endorsements.map(function(endorsement) {
        return (
          <tbody>
            <tr>
              <td>{endorsement.title}</td>
              <td>{endorsement.review_date}</td>
              <td>{endorsement.author}</td>
            </tr>
            <tr>
              <td>{endorsement.review}</td>
            </tr>
          </tbody>
        )
      });

      return (
        <div className="container">
          {/*Header*/}
          <div id="location" className="center-align section scrollspy">
            <h1>
              {this.state.org.name}
            </h1>
            {this.state.org.address ?
              <div>
                <i className="medium material-icons">room</i>
                <h5>{this.state.org.address}</h5>
              </div> : ""
            }
          </div>
          <div className="row">
            {/*Follow Button*/}
            <div className="col s2 push-s10 pinned" style={{top: "110px", zIndex: "1"}}>
              {
                !this.state.following &&
                 this.state.org.followers.indexOf(localStorage.token) === -1
                 ? <a className="btn-floating btn-large btn tooltipped waves-effect waves-light light-blue darken-3" onClick={this.followOrg} data-position="left" data-delay="50" data-tooltip="Follow Organization"><i className="material-icons">group_add</i></a>
                 : <span className="btn blue">Following</span>
              }
              {this.state.followError ? <span style={{marginLeft: '10px', color: 'red'}}>{this.state.followError}</span> : ''}
            </div>

            <div className="col s12 m10 l11">
              <div className="row">

                {/*Image 1*/}

                <div className="col s12">
                  <img className="responsive-img materialboxed" src={profileImg} />
                </div>

                {/*Org Description*/}
                <div id="description" className="col s12 m10 push-m1 center-align section scrollspy flow-text">
                  <i className="medium material-icons space-above">description</i>
                  <h5>Description</h5>
                  <p>{this.state.org.about}</p>
                </div>

                {/*Additional Info*/}
                <div className="col s12 m5 l6">
                  <blockquote>"We care about the world around us!"</blockquote>
                </div>

                {/*Image 2*/}
                <div className="col s12 m7 l6">
                  <img className="responsive-img materialboxed circle" src={secondImg}/>
                </div>
              </div>

              <div className="row">
                {/*Areas of Focus*/}
                <div id="aofs" className="col s12 m10 push-m1 pull-m1 center-align section scrollspy">
                  <i className="medium material-icons space-above">location_searching</i>
                  <h4>Areas of focus</h4>
                  {aofs}
                </div>

                {/*Current Project*/}
                <div id="current-projects" className="col s12 center-align section scrollspy">
                  <i className="medium material-icons space-above">assignment_late</i>
                  <h2>Our Current Projects</h2>
                  <div className="collection">
                    {currentProjects.length > 0 ? currentProjects : <div>No projects to display</div>}
                  </div>
                </div>

                {/*Past Projects*/}
                {pastProjects.length > 0 ?
                  (<div id="past-projects" className="col s12 center-align section scrollspy">
                    <i className="medium material-icons space-above">assignment_turned_in</i>
                    <h2>Our Past Projects</h2>
                    <div className="collection">
                      {pastProjects}
                    </div>
                  </div>) : ""}

                {/*Endorsements*/}
                <div id="endorsements" className="col s12 center-align section scrollspy">
                  <i className="medium material-icons space-above">verified_user</i>
                  <h2>Endorsements</h2>
                  <div className="left-align">
                    <table>
                      {endorsements}
                    </table>
                  </div>
                </div>

              </div>
            </div>

            {/*ScrollSpy*/}
            <div className="col hide-on-small-only m2 l1">
              <ScrollSpyListItems
                address={this.state.org.address}
                hasPastProjects={pastProjects.length > 0}
                hasCurrentProjects={currentProjects.length > 0}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div></div>
      );
    }
  }
});

var ScrollSpyListItems = React.createClass({
  render: function () {
    return(
      <div className="toc-wrapper pinned" >
        <div>
          <ul className="section table-of-contents">
            {this.props.address ?
              <li>
                <a href="#location">
                  Location
                </a>
              </li> : ""
            }

            <li>
              <a href="#description">
                Description
              </a>
            </li>
            <li>
              <a href="#aofs">
                Areas of Focus
              </a>
            </li>
            {
              this.props.hasCurrentProjects ? (
                <li>
                  <a href="#current-projects">
                    Current Projects
                  </a>
                </li>
              ) : (
               ""
              )
            }
            {
              this.props.hasPastProjects ? (
                <li>
                  <a href="#past-projects">
                    Past Projects
                  </a>
                </li>
              ) : (
                ""
              )
            }
            <li>
              <a href="#endorsements">
                Endorsements
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});
