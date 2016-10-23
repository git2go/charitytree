"use strict";

import React, { Component } from 'react';

import { OrgProfile } from '../components/dashboard/org/profile.js';
import { Projects } from '../components/dashboard/org/projects.js';
import { Media } from '../components/dashboard/org/media.js';
import { OrgFeed } from '../components/dashboard/org/feed.js';
import { Endorsement } from '../components/dashboard/org/endorsement.js';

import { DonorProfile } from '../components/dashboard/donor/profile.js';
import { DonorFeed } from '../components/dashboard/donor/feed.js';
import { Activity } from '../components/dashboard/donor/activity.js';

export class Dashboard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: {},
            userType: '',
            view: 'feed'
        }

        this.logout = this.logout.bind(this)
        this.getData = this.getData.bind(this)
        this.update_db_state_prop = this.update_db_state_prop.bind(this)
        this.showOrgDashboard = this.showOrgDashboard.bind(this)
        this.showDonorDashboard = this.showDonorDashboard.bind(this)
        this.updatePageView = this.updatePageView.bind(this)
    }

    componentWillMount() {
        this.props.isLoggedIn();
        $(".button-collapse").sideNav();
    }

    componentDidMount() {
        this.getData();
    }

    logout() {
        $.ajax({
            type: 'POST',
            url: '/auth/logout',
            success: function () {
                feeder.emit('disconnect');
                localStorage.clear();
                browserHistory.push(`/login`);
            }.bind(this),
            error: function (xhr, status, err) {
            }.bind(this)
        });
    }

    getData() {
        const self = this;

        $.ajax({
            method: 'GET',
            url: '/dashboard_data',
            success: function(response) {
                feeder.emit('getFeed', response.results._id);
                self.setState({
                    data: response.results,
                    userType: response.userType,
                    view: self.state.view
                });

                $(".dropdown-button").dropdown({
                    hover: true,
                    belowOrigin: true
                });
            },
            error: function(xhr, status, error) {
                if (xhr.status === 401) { //user's session expired
                    self.logout();
                }
                if (xhr.readyState == 0 || xhr.status == 0) {
                    return;
                }
            }
        });
    }

    showOrgDashboard() {
        let view;
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
    }

    showDonorDashboard() {
        let view;
        switch (this.state.view) {
            case 'profile':
            const donorInfo = {
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
                endorsements={this.state.data.endorsements}
            />;
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
    }

    update_db_state_prop(changes) {
        const state = this.state.data;
        for (var prop in changes) {
            state[prop] = changes[prop];
        }
        this.setState({ data: state });
    }

    updatePageView(view) {
        this.setState({ view });
    }

    render() {
        if (this.state.userType === 'organization') {
            return this.showOrgDashboard();
        } else if (this.state.userType === 'donor') {
            return this.showDonorDashboard();
        }
        return <div></div>
    }
}

function OrgDashboardMenu(props) {
    const goToPage = function(e) {
        e.preventDefault();
        props.updatePageView(e.target.innerHTML.toLowerCase());
    }

    return (
        <div>
            <ul id="slide-out" className="side-nav fixed waves-effect waves-light">
                <li className="valign-wrapper"><i className="material-icons left valign">supervisor_account</i><a onClick={goToPage}>Feed</a></li>
                <li className="valign-wrapper"><i className="material-icons left valign">person_pin</i><a onClick={goToPage}>Profile</a></li>
                <li className="valign-wrapper"><i className="material-icons left valign">perm_media</i><a onClick={goToPage}>Projects</a></li>
                <li className="valign-wrapper"><i className="material-icons left valign">video_library</i><a onClick={goToPage}>Media</a></li>
                <li className="valign-wrapper"><i className="material-icons left valign">stars</i><a onClick={goToPage}>Endorsements</a></li>
            </ul>
            <a data-activates="slide-out" className="button-collapse"/>
        </div>
    )
}

function DonorDashboardMenu(props) {
    const goToPage = function(e) {
        e.preventDefault();
        props.updatePageView(e.target.innerHTML.toLowerCase());
    }

    return (
        <div>
            <ul id="slide-out" className="side-nav fixed waves-effect waves-light">
                <li className="valign-wrapper"><i className="material-icons left valign">question_answer</i><a onClick={goToPage}>Feed</a></li>
                <li className="valign-wrapper"><i className="material-icons left valign">person_pin</i><a onClick={goToPage}>Profile</a></li>
                <li className="valign-wrapper"><i className="material-icons left valign">video_library</i><a onClick={goToPage}>Activity</a></li>
                <li className="valign-wrapper"><i className="material-icons left valign">stars</i><a onClick={goToPage}>Endorsements</a></li>
            </ul>
            <a data-activates="slide-out" className="button-collapse"/>
        </div>
    )
}
