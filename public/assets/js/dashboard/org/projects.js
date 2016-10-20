"use strict";
var React = require('react');
import moment from 'moment';
moment().format();

import {ProjectCreate} from './projectCreate.js'
import {ProjectEdit} from './edit_project.js'
import {MediaUpload} from '../media_upload.js'

exports.Projects = React.createClass({
  componentWillReceiveProps: function(nextProps) {
    if (this.props.projects.length !== nextProps.projects.length) {
      this.setState({ projects: nextProps.projects, action: '' })
    } else {
      this.setState({ action: '' });
    }
  },

  getInitialState: function() {
    return {
      action: '',
      projects: [],
      currentProject: {}
    }
  },

  getProjects: function() {
    $.ajax({
      method: 'GET',
      url: '/dashboard_data/projects',
      success:function(response) {
        // this.setState({ projects: response.results.projects, action: 'display' });
        this.props.update_db_state_prop({ 'projects': response.results.projects }); //update dashboard state property
      }.bind(this),
      error: function(error){
      }
    });
  },

  update: function(formData) {
    $.ajax({
      method: 'POST',
      url: '/dashboard_data/projects',
      data: formData,
      success: function(response) {
        this.setState({ projects: response.results });
      }.bind(this),
      error: function(error){
      }
    });
  },

  create: function(e) {
    e.preventDefault();
    this.setState({ action: 'create' });
  },

  edit: function(project) {
    this.setState({ currentProject: project, action: 'edit' });
  },

  display: function(project) {
    this.setState({ currentProject: project, action: 'display' });
  },

  createProject: function() {
    return <div><ProjectCreate submitHandler={this.submitHandler} /></div>
  },

  displayProject: function(project) {
    return <div><ProjectView project={this.state.currentProject} /></div>
  },

  editProject: function() {
    return <div><ProjectEdit submitHandler={this.submitHandler} project={this.state.currentProject} /></div>
  },

  submitHandler: function() {
    this.getProjects();
  },

  showProjects: function() {
    var org_projects = this.state.projects.length ? this.state.projects : this.props.projects;
    return (
      <div>
        <div style={{height: "15px"}}></div>
        <div className="center">
          <a className="waves-effect waves-light btn-large light-blue darken-3 hide-on-med-and-down"onClick={this.create}><i className="material-icons left">add</i>Create a new Project for your organization</a>
          <a className="waves-effect waves-light btn-large light-blue darken-3 hide-on-small-only hide-on-large-only"onClick={this.create}><i className="material-icons left">add</i>Create a new Project</a>
          <a className="waves-effect waves-light btn-large light-blue darken-3 hide-on-med-and-up"onClick={this.create}><i className="material-icons left">add</i>New Project</a>
        </div>
        <div style={{height: "5px"}}></div>

        <div className="row">
          {org_projects.map(function(project, idx) {
            return (
              <ProjectBlurb
                key={idx}
                project={project}
                edit={this.edit}
                display={this.display}
              />
            );
          }.bind(this))}
        </div>
      </div>
    )
  },

  render: function() {
    switch (this.state.action) {
      case 'display':
        return this.displayProject();
        break;
      case 'create':
        return this.createProject();
        break;
      case 'edit':
        return this.editProject();
        break;
      default:
      return this.showProjects()
    }
  }
});

var ProjectBlurb = React.createClass({
  getInitialState: function() {
    return {
      display: true
    }
  },

  displayProject: function() {
    this.props.display(this.props.project);
  },

  editProject: function(e) {
    e.preventDefault();
    this.props.edit(this.props.project);
  },

  changeDisplay: function(e) {
    e.preventDefault();
    this.setState({ display: false });
    // $('.box__input').addClass('size-to-fit');
  },

  display: function() {
    var obj = this.state.project || this.props.project;
    var img = (obj.images && obj.images.length)
      ? "/dashboard_data/project/media/" + obj.images[0]
      : "./images/FEATURE-Leaf-300_tcm18-150961.jpg";

    return (
      <div className="col s12 m6 l4">
        <div className="card hoverable">
          <div className="card-image" onClick={this.displayProject} style={{maxHeight: "250px", overflow: "hidden"}}>
            <img className="responsive-img materialboxed" src={img} />
            <span className="card-title shadow">{this.props.project.title}</span>
          </div>
          <div className="card-content" onClick={this.displayProject}>
            <p className="line-clamp line-clamp-3">{"Description: " + this.props.project.info}</p>
            <p>{"Created: " + moment(this.props.project.created_date).format('MMMM D, YYYY')}</p>
            <p>{"End Date: " + moment(this.props.project.end_date).format('MMMM D, YYYY')}</p>
            <p>{"Status: " + this.props.project.status}</p>
            <p>{"Total Donors: " + this.props.project.total_donors_participating}</p>
          </div>
          <div className="card-action center-align row">

            <div className="col s12 l6 left" style={{fontSize: "10px"}}>
              <button className="waves-effect waves-light btn-large light-blue darken-3" onClick={this.editProject}>Update</button>
            </div>
            <div className="col s12 l6 right" style={{fontSize: "10px"}}>
              <button className="waves-effect waves-light btn-large light-blue darken-3" onClick={this.changeDisplay}>Upload Media</button>
            </div>
          </div>
        </div>
      </div>
    )
  },

  mediaUpload: function() {
    return (
      <div className="project-blurb card blue-grey darken-1">
        <MediaUpload project={this.props.project._id} action={"/dashboard/project/media/upload"} />
      </div>
    )
  },

  render: function() {
    return (this.state.display) ? this.display() : this.mediaUpload();
  }
});

var ProjectView = React.createClass ({
  displayName: 'ProjectView',

  getInitialState: function(){
    return {
      project: {}
    };
  },

  render: function() {
    var project = this.props.project;
    var needs;

    if (project.needs_list.length > 0) {
      needs = project.needs_list.map(function(need, index) {
        return (
          <Need
            key={index}
            title={need.title}
            description={need.description}
            cost={need.cost}
            quantity_needed={need.quantity_needed}
            number_purchased={need.number_purchased}
          />
        );
      }.bind(this));
    }

    var percentRaised = {width: (project.amount.current / project.amount.goal * 100) + "%"};

    return (
      <div>
        <div className="center-align">
          <h3>{project.title}</h3>
        </div>

        <div id="description" className="col s12">
          <h5>Description</h5>
          {project.info}
        </div>

        <div className="row">
          <div className="col s12 m8">
            <img className="responsive-img materialboxed" style={{margin: "auto"}} src="http://worldofgoodethiopia.org/yahoo_site_admin/assets/images/30050052.182123348_std.jpg" />
          </div>
          <div className="col s12 m4">
            <h3>Goal: ${project.amount.goal}</h3>
            <h4>Progress: ${project.amount.current}</h4>
            <div className="progress">
              <div className="determinate" style={percentRaised}></div>
            </div>
            <h5>Number of donors: {project.total_donors_participating}</h5>
            <h6>Status: {project.status}</h6>
          </div>
        </div>

        <div className="row">
          <h5>Needs</h5>
          <div className="col s12 m8">
            {needs ? needs : "No needs to display"}
          </div>
        </div>

        <div className="row project-media">
          <div className="row">
            <h5>Images</h5>
            {project.images.map(function(image, idx) {
              return <img key={idx}
                src={'/dashboard_data/project/media/' + image}
                style={{width: '200px', height: '200px'}}
                />
            })}
          </div>

          <div className="row">
            <h5>Videos</h5>
            {project.videos.map(function(video, idx) {
              return <video key={idx}
                src={'/dashboard_data/project/media/' + video} controls>
                style={{width: '320px', height: '240px'}}
                </video>
            })}
          </div>
        </div>
      </div>
    );
  }
});

var Need = React.createClass({
  render: function() {
    return (
      <div>
        <span className="card-title">{this.props.title}</span>
        <p>description: {this.props.description}</p>
        <p>cost: {this.props.cost}</p>
        <p>needed: {this.props.quantity_needed}</p>
        <p>purchased: {this.props.number_purchased || 0}</p>
      </div>
    );
  }
});
