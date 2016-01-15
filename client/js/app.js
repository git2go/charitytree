import React from 'react';
import { History } from 'react-router';
var LocalStorageMixin = require('react-localstorage');

import { loggedIn } from '../config/routes.js';
import {Navbar} from './navbar.js';



var App = exports.App = React.createClass({
  displayName: 'App',
  mixins: [History, LocalStorageMixin],
  getInitialState: function () {
    return {
      loggedIn: false,
      searchText: "",
      searchCriteria: [],
      searchResults: [],
      projectId: "",
      orgId: "",
      currentOrganization: null,
      currentProject: null,
      userType: ''
    };
  },

  isLoggedIn: function () {
    this.setState({ loggedIn: loggedIn() });
  },

  setUserType: function(e) {
    this.setState( {userType: e.target.value });
    this.props.history.pushState(null, `/signup`);
  },

  componentDidMount: function () {
    if (this.state.searchText && window.location.pathname === "/search") {
      this.handleSearchSubmit();
    }
  },

  updateSearchCriteria: function(tags) {
    this.setState({
      searchCriteria: tags
    })
  },

  navigateToOrganizationPage: function () {
    this.props.history.pushState(null, `/organization`);
  },

  navigateToDonate: function () {
    this.props.history.pushState(null, `/donate`);
  },

  navigateToBrowsePage: function () {
    this.props.history.pushState(null, `/browse`);
  },

  navigateToProjectPage: function () {
    this.props.history.pushState(null, `/project`);
  },

  updateInput: function (searchText) {
    this.setState({
      searchText: searchText
    });
  },

  removeBrowseTag: function(tagName) {
    var searchCriteria = this.state.searchCriteria.slice();
    var tagIdx = searchCriteria.indexOf(tagName);
    searchCriteria.splice(tagIdx, 1);
    this.setState({
      searchCriteria: searchCriteria
    });
  },

  removeSearchTag: function(tagName) {
    var searchCriteria = this.state.searchCriteria.slice();
    var tagIdx = searchCriteria.indexOf(tagName);
    searchCriteria.splice(tagIdx, 1);
    var searchText = "";
    if (searchCriteria.length > 0) {
      searchText = searchCriteria.join(" ");
    }
    this.setState({
      searchText: searchText,
      searchCriteria: searchCriteria
    });
    var self = this;
    var i = setInterval(function () {
      if (searchCriteria === self.state.searchCriteria) {
        clearInterval(i);
        self.handleSearchSubmit();
      }
    }, 100);
  },

  handleSearchButton: function (searchText) {
    this.setState({
      searchText: searchText
    });
    var self = this;
    var i = setInterval(function () {
      if (searchText === self.state.searchText) {
        clearInterval(i);
        self.handleSearchSubmit();
      }
    }, 100);
  },

  handleSearchSubmit: function () {
    if (this.state.searchText) {
      var searchCriteria = this.state.searchText.split(" ");
      $.ajax({
        url: "/post_search",
        // dataType: 'json',
        method: "POST",
        data: {aofs: searchCriteria},
        success: function (data) {
          this.setState({
            searchText: this.state.searchText,
            searchCriteria: searchCriteria,
            searchResults: data.results
          });
          this.props.history.pushState(null, `/search`);

        }.bind(this),
        error: function (xhr, status, err) {
          console.error(xhr, status, err.toString());
        }.bind(this)
      });
    } else {
      this.setState({
        searchText: this.state.searchText,
        searchCriteria: [],
        searchResults: []
      });
    }
  },

  getProject: function(projectId) {
    this.setState({
      projectId: projectId
    });
    var self = this;
    var i = setInterval(function () {
      if (projectId === self.state.projectId) {
        clearInterval(i);
        self.props.history.pushState(null, `/project`);
      }
    }, 100);
  },

  setProject: function(project){
    this.setState({
      searchText: this.state.searchText,
      searchCriteria: this.state.searchCriteria,
      searchResults: this.state.searchResults,
      projectId: this.state.projectId,
      orgId: this.state.orgId,
      currentOrganization: this.state.currentOrganization,
      currentProject: project
    });
    localStorage.projectId = this.state.projectId;
    this.navigateToProjectPage();
  },

  setOrganization: function(org){
    this.setState({
      searchText: this.state.searchText,
      searchCriteria: this.state.searchCriteria,
      searchResults: this.state.searchResults,
      projectId: this.state.projectId,
      orgId: this.state.orgId,
      currentOrganization: org
    });
    this.navigateToOrganizationPage();
  },

  render: function () {
    return (
      <div>
        <Navbar
          loggedIn={this.state.loggedIn}
          isLoggedIn={this.isLoggedIn}
          searchText={this.state.searchText}
          updateInput={this.updateInput}
          handleSearchSubmit={this.handleSearchSubmit}/>
        {this.props.children && React.cloneElement(this.props.children,
          {
            //State Props
            searchText: this.state.searchText,
            searchCriteria: this.state.searchCriteria,
            searchResults: this.state.searchResults,
            projectId: this.state.projectId,
            currentOrganization: this.state.currentOrganization,
            userType: this.state.userType,
            currentProject: this.state.currentProject,
            //Functions
            navigateToDonate: this.navigateToDonate,
            isLoggedIn: this.isLoggedIn,
            handleSearchButton: this.handleSearchButton,
            updateInput: this.updateInput,
            handleSearchSubmit: this.handleSearchSubmit,
            updateSearchCriteria: this.updateSearchCriteria,
            removeBrowseTag: this.removeBrowseTag,
            removeSearchTag: this.removeSearchTag,
            getProject: this.getProject,
            setProject: this.setProject,
            setOrganization: this.setOrganization,
            setUserType: this.setUserType,
            navigateToProjectPage: this.navigateToProjectPage,
            navigateToOrganizationPage: this.navigateToOrganizationPage
          }
        )}
      </div>
    );
  }
});
