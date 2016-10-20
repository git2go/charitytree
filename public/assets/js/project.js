import React from 'react';
import { Link, History } from 'react-router';
import LocalStorageMixin from 'react-localstorage';

import { TagContainer, Tag } from './tagContainer.js';
import { CausesInfo } from './causesinfo.js';
import { Needs } from './needs.js';

//var ReactIntl = require('react-intl');
//var IntlMixin       = ReactIntl.IntlMixin;
//var FormattedNumber = ReactIntl.FormattedNumber;

exports.Project = React.createClass ({
  displayName: 'Project',
  mixins: [ History,LocalStorageMixin ],

  getInitialState: function(){
    return {
      project: null
    };
  },

  componentDidMount: function () {

    $.ajax({
        url:'/project/'+localStorage.currentProjID,
        method: "GET",
        success: function (data) {

          this.setState({
            project: data.results
          });

          $('.materialboxed').materialbox();
          $('ul.tabs').tabs(); //both of these needed
          $('ul.tabs').tabs('select_tab', 'tab_id'); //both of these needed
        }.bind(this),
        error: function (xhr, status, err) {
          console.error(xhr, status, err.toString());
        }.bind(this)
      });

  },

  setCurrentOrg: function(){
    for(var i = 0; i < this.props.searchResults.orgs.length; i++){
      if(this.props.searchResults.orgs[i]._id === this.props.currentProject.org){
        this.props.setOrganization(this.props.searchResults.orgs[i]);
      }
    }
  },

  navToOrg: function(){
    localStorage.setItem('currentOrganization', this.state.project._org._id);
    this.props.navigateToOrganizationPage();
  },

  navigateToDonate: function(){
    this.props.navigateToDonate();
  },

  render: function() {
    // var project = this.props.searchResults.projects.filter(function(project){
    //   if(project._id === this.props.projectId) {
    //     return project;
    //   }
    // }.bind(this));
    // project = project[0];
    if(this.state.project) {
      var project = this.state.project;
      // var org = JSON.parse(localStorage.getItem('currOrgObj'));

      var needs;
      var img = (this.state.project.images.length)
      ? "/dashboard_data/project/media/" + this.state.project.images
      : "http://worldofgoodethiopia.org/yahoo_site_admin/assets/images/30050052.182123348_std.jpg";

      if (project.needs_list.length > 0) {
        needs = project.needs_list.map(function (need, index) {
          return (
            <Needs
              key={index}
              title={need.title}
              description={need.description}
              cost={need.cost}
              quantity_needed={need.quantity_needed}
              number_purchased={need.number_purchased}
              navigateToDonate={this.props.navigateToDonate}
              project={this.state.project}/>
          );
        }.bind(this));
      }

      var percentRaised = {width: (project.amount.current / project.amount.goal * 100) + "%"};

      return (
        <div>
          <div className="center-align">
            <h3>{project.title}</h3>
            <div onClick={this.navToOrg}>
              <h4>Sponsored by: {this.state.project._org.name}</h4>
            </div>
          </div>

          <div className="row">
            <div className="col s12 m8">
              <img className="responsive-img materialboxed" style={{margin: "auto"}} src={img} />
            </div>
            <div className="col s12 m4">
              <h3>Goal: ${project.amount.goal}</h3>
              <h4>Progress: ${project.amount.current}</h4>
              <div className="progress">
                <div className="determinate" style={percentRaised}>
                </div>
              </div>
              <h5>Number of donors: {project.total_donors_participating}</h5>
              <h6>Status: {project.status}</h6>
            </div>
          </div>


          <div className="row">
            <div className="col s12 m4 push-m8" onClick={this.navigateToDonate}>
              {needs ? needs : "No needs to display"}
            </div>
            <div className="col s12 m8 pull-m4">

              <div className="row">
                <div className="col s12">
                  <ul className="tabs">
                    <li className="tab col s3"><a href="#description">Description</a></li>
                    <li className="tab col s3"><a href="#updates">Updates</a></li>
                    <li className="tab col s3"><a href="#comments">Comments</a></li>
                  </ul>
                </div>
                <div id="description" className="col s12">
                  <h5>Description</h5>
                  {project.info}
                </div>
                <div id="updates" className="col s12">
                  <h5>Updates</h5>
                  <p>Knausgaard PBR&B organic, pickled skateboard etsy freegan vice green juice tacos. Small batch YOLO gluten-free humblebrag etsy skateboard. Freegan normcore selvage stumptown williamsburg pinterest marfa. 90s ramps aesthetic, cliche farm-to-table kickstarter narwhal YOLO whatever small batch mustache. Schlitz mlkshk yr, etsy craft beer keffiyeh single-origin coffee. XOXO kickstarter flannel, fingerstache PBR&B tousled wayfarers kale chips ramps kitsch craft beer. Blue bottle put a bird on it deep v DIY, four loko retro distillery.
                  </p>
                </div>

                <div id="comments" className="col s12">
                  <h5>Comments</h5>
                  <p>Pabst kogi cardigan echo park raw denim helvetica. Mlkshk echo park PBR&B, dreamcatcher franzen forage iPhone blog pop-up four dollar toast fixie chartreuse VHS brunch leggings. Chillwave pitchfork forage venmo, pork belly irony authentic ugh. Literally gentrify banh mi pinterest hoodie. Typewriter migas mlkshk hoodie letterpress biodiesel post-ironic. Church-key pitchfork mlkshk, cardigan everyday carry fashion axe tofu. Intelligentsia DIY shabby chic, chartreuse cardigan occupy distillery tilde artisan kogi flexitarian readymade.
                  </p></div>
              </div>
            </div>
          </div>
       </div>
      );
    } else {
      return(
        <div></div>
      );
    }
  }
});
