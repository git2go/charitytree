"use strict";
var React = require('react');
import { Link, History } from 'react-router';
import { TagContainer, Tag } from './tagContainer.js';

exports.Search = React.createClass({
  componentWillMount: function() {
  },

  componentDidMount: function() {
  },

  render: function () {
    return (
      <div>
        <div className="row">
          <h3 className="center-align condensed light"> Find a cause to give to </h3>

          {/*Search Tags*/}
          <div className="center-align col s12">
            <TagContainer
              searchCriteria={this.props.searchCriteria}
              removeSearchTag={this.props.removeSearchTag}/>
          </div>

          {/*Project Search Results*/}
          <div className="col s12 m8 push-m4 l9 push-l3">
            <h5 className="center-align condensed light">Project Search Results</h5><hr/>
            <ProjectResults
              searchResultsProjects={this.props.searchResults.projects}
              getProject={this.props.getProject}
              setProject={this.props.setProject}/>
          </div>

          {/*Org Search Results*/}
          <div className="col s12 m4 pull-m8 l3 pull-l9">
            <h5 className="center-align condensed light">Organizations</h5><hr/>
            <OrganizationResults
              searchResultOrgs={this.props.searchResults.orgs}
              setOrganization={this.props.setOrganization}
              searchResultOrgs={this.props.searchResults.orgs}/>
          </div>

        </div>
      </div>
    );
  }
});

var OrganizationResults = React.createClass({
  render: function () {
    if (this.props.searchResultOrgs) {
      var org = this.props.searchResultOrgs.map(function(organization, index){
        return (
          <Organization
            key={index}
            org={organization}
            setOrganization={this.props.setOrganization}/>
        )
      }.bind(this));
    }
    return (
      <div className="container">
        <div className="row">
          {org ? org : <h5 className="center-align">No results to display</h5>}
        </div>
      </div>
    );
  }
});

var Organization = React.createClass({
  setOrganization: function() {
    localStorage.currentOrgID = this.props.org._id;
    this.props.setOrganization(this.props.org);
    localStorage.currentOrganization = this.props.org._id;
  },

  render: function () {
    var img = (this.props.org.profile_img) ? "/organization/profile_img/" + this.props.org._id
        : "http://previews.123rf.com/images/kritchanut/kritchanut1406/kritchanut140600093/29213195-Male-silhouette-avatar-profile-picture-Stock-Vector-profile.jpg";
    return (
      <div className="cardx hoverable" onClick={this.setOrganization}>
        <div className="card-image ">
          <img src={img}/>
          <span className="card-title shadow">
            <h4>{this.props.org.name}</h4>
          </span>
        </div>

        <div className="card-content">
          <div className="line-clamp line-clamp-5 condensed light">
            {this.props.org.about}
          </div>
        </div>

      </div>
    );
  }
});

var ProjectResults = React.createClass({
  render: function () {
    if (this.props.searchResultsProjects) {
      var projects = this.props.searchResultsProjects.map(function (project, index) {
        return (
          <Project
            key={index}
            title={project.title}
            info={project.info}
            areas_of_focus={project.areas_of_focus}
            projectId={project._id}
            getProject={this.props.getProject}
            setProject={this.props.setProject}
            project={project}/>
        );
      }.bind(this));
    }
    return(
      <div className="row">
        {projects ? projects : <h5 className="center-align">No results to display</h5>}
      </div>
    );
  }
});

var Project = React.createClass({
  setProject: function(){

    localStorage.currentProjID = this.props.projectId;
    this.props.setProject(this.props.project);
},

  getProject: function() {
    this.props.getProject(this.props.projectId);
  },

  render: function () {
    var img = (this.props.project.images && this.props.project.images.length)
      ? "/dashboard_data/project/media/" + this.props.project.images[0]
      : "http://worldofgoodethiopia.org/yahoo_site_admin/assets/images/30050052.182123348_std.jpg";

    return (
    <div className="col s12 m6 l4" onClick={this.setProject}>
      <div className="card hoverable">
        <div className="card-image">
          <img className="responsive-img" src={img} />
            <span className="card-title shadow">
              {this.props.title}
            </span>
        </div>

        <div className="card-content">
          <div className="line-clamp line-clamp-5 condensed light">
            {this.props.info}
          </div>
        </div>

      </div>
    </div>
    );
  }
});
