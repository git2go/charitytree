"use strict";
var React = require('react');
import {History} from 'react-router';

import {OrgProfile} from './dashboard/org/profile.js';
import {Projects} from './dashboard/org/projects.js';
import {Media} from './dashboard/org/media.js';
import {OrgFeed} from './dashboard/org/feed.js';
import {Endorsement} from './dashboard/org/endorsement.js';

import {DonorProfile} from './dashboard/donor/profile.js';
import {DonorFeed} from './dashboard/donor/feed.js';
import {Activity} from './dashboard/donor/activity.js';

exports.Dashboard = React.createClass({
  getInitialState: function() {
    return {
      data: {},
      userType: '',
      view: 'feed'
    }
  },
  componentWillMount: function() {
    this.props.isLoggedIn();
    $(".button-collapse").sideNav();
  },

  componentDidMount: function() {
    this.getData();
  },

  navigateToDashboard: function () {
    this.props.history.pushState(null, `/dashboard`);
  },

  logout: function () {
    $.ajax({
      type: 'POST',
      url: '/logout_post',
      success: function () {
        feeder.emit('disconnect');
        localStorage.clear();
        this.props.history.pushState(null, `/login`);
        // window.location.href = 'http://localhost:4000';
      }.bind(this),
      error: function (xhr, status, err) {
        console.log("Error posting to: " + xhr, status, err.toString());
      }.bind(this)
    });
  },

  getData: function() {
    $.ajax({
      method: 'GET',
      url: '/dashboard_data',
      success: function(response) {
        console.log("Response data: ", response);
        feeder.emit('getFeed', response.results._id);
        this.setState({
          data: response.results,
          userType: response.userType,
          view: this.state.view
        });

        $(".dropdown-button").dropdown({
          hover: true,
          belowOrigin: true
        });
      }.bind(this),
      error: function(xhr, status, error) {
        if (xhr.status === 401) { //user's session expired
          this.logout();
        }
        if (xhr.readyState == 0 || xhr.status == 0) {
          return;
        }
        else {
        console.log("Dashboard: ", xhr, status, error);  
        }
      }.bind(this)
    });
  },

  showOrgDashboard: function() {
    var view;
    switch (this.state.view) {
      case 'profile':
        var orgInfo = {
          name: this.state.data.name,
          username: this.state.data.username,
          about: this.state.data.about,
          areas_of_focus: this.state.data.areas_of_focus,
          address: this.state.data.address
        };
        view = <OrgProfile update_db_state_prop={this.update_db_state_prop} orgInfo={orgInfo} />;
        break;
      case 'projects':
        view = <Projects
          update_db_state_prop={this.update_db_state_prop}
          projects={this.state.data.projects}
          setProject={this.props.setProject}
        />;
        break;
      case 'media':
        var media = {
          profile_img: this.state.data.profile_img,
          images: this.state.data.images,
          videos: this.state.data.videos,
        };
        view = <Media username={this.state.data.username} media={media} update_db_state_prop={this.update_db_state_prop} />;
        break;
      case 'endorsements':
        view = <Endorsement endorsements={this.state.data.endorsements} />;
        break;
      case 'feed':
        view = <OrgFeed user={this.state.data.name} feed={this.state.data.feed} />;
        break;
      default:
        view = <div></div>
    }
    return (
      <div>
        <div className="dashboard-menu"><OrgDashboardMenu updatePageView={this.updatePageView} /></div>
        <div className="dashboard-view indent">{view}</div>
      </div>
    )
  },

  showDonorDashboard: function() {
    var view;
    switch (this.state.view) {
      case 'profile':
        var donorInfo = {
          name: this.state.data.name,
          username: this.state.data.username,
          email: this.state.data.email,
          areas_of_focus: this.state.data.areas_of_focus,
          profile_img: this.state.data.profile_img
        };
        view = <DonorProfile update_db_state_prop={this.update_db_state_prop} donorInfo={donorInfo} />;
        break;
      case 'feed':
        var user = this.state.data.name.first + " " + this.state.data.name.last;
        view = <DonorFeed user={user} feed={this.state.data.feed} />;
        break;
      case 'activity':
        view = <Activity
          donor={this.state.data._id}
          update_db_state_prop={this.update_db_state_prop}
          sponsorships={this.state.data.sponsored_projects}
          following={this.state.data.following}
          endorsements={this.state.data.endorsements} />;
        break;
      case 'endorsement':
        view = <Endorsements />;
        break;
      default:
        view = <div></div>
    }
    return (
      <div>
        <div className="dashboard-menu"><DonorDashboardMenu updatePageView={this.updatePageView} /></div>
        <div className="dashboard-view indent">{view}</div>
      </div>
    )
  },

  update_db_state_prop: function(changes) {
    var state = this.state.data;
    // console.log('State before update: ', state);
    for (var prop in changes) {
      state[prop] = changes[prop];
    }
    // console.log('State after update: ', state);
    this.setState({ data: state });
  },

  updatePageView: function(view) {
    console.log(view);
    this.setState({ view: view });
  },

  render: function() {
    if (this.state.userType === 'organization') {
      return this.showOrgDashboard();
    } else if (this.state.userType === 'donor') {
      return this.showDonorDashboard();
    }
    return <div></div>
  }
});

var OrgDashboardMenu = React.createClass({
  goToPage: function(e) {
    e.preventDefault();
    this.props.updatePageView(e.target.innerHTML.toLowerCase());
  },

  render: function() {
    return (
      <div>
        <ul id="slide-out" className="side-nav fixed waves-effect waves-light">
          <li className="valign-wrapper"><i className="material-icons left valign">supervisor_account</i><a onClick={this.goToPage}>Feed</a></li>
          <li className="valign-wrapper"><i className="material-icons left valign">person_pin</i><a onClick={this.goToPage}>Profile</a></li>
          <li className="valign-wrapper"><i className="material-icons left valign">perm_media</i><a onClick={this.goToPage}>Projects</a></li>
          <li className="valign-wrapper"><i className="material-icons left valign">video_library</i><a onClick={this.goToPage}>Media</a></li>
          <li className="valign-wrapper"><i className="material-icons left valign">stars</i><a onClick={this.goToPage}>Endorsements</a></li>
        </ul>
        <a data-activates="slide-out" className="button-collapse"/>
      </div>
    )
  }
});

var DonorDashboardMenu = React.createClass({
  goToPage: function(e) {
    e.preventDefault();
    this.props.updatePageView(e.target.innerHTML.toLowerCase());
  },

  render: function() {
    return (
      <div>
        <ul id="slide-out" className="side-nav fixed waves-effect waves-light">
          <li className="valign-wrapper"><i className="material-icons left valign">question_answer</i><a onClick={this.goToPage}>Feed</a></li>
          <li className="valign-wrapper"><i className="material-icons left valign">person_pin</i><a onClick={this.goToPage}>Profile</a></li>
          <li className="valign-wrapper"><i className="material-icons left valign">video_library</i><a onClick={this.goToPage}>Activity</a></li>
          <li className="valign-wrapper"><i className="material-icons left valign">stars</i><a onClick={this.goToPage}>Endorsements</a></li>
        </ul>
        <a data-activates="slide-out" className="button-collapse"/>
      </div>
    )
  }
});
