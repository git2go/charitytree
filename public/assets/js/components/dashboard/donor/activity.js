"use strict";

import React, { Component } from 'react';

export class Activity extends Component {
    constructor(props) {
        super(props)

        this.state = {
            action: '',
            org_to_endorse: ''
        }

        this.endorse = this.endorse.bind(this)
        this.endorsePage = this.endorsePage.bind(this)
        this.defaultPage = this.defaultPage.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ action: 'display' });
    }

    endorse(org) {
        this.setState({ action: 'endorse', org_to_endorse: org });
    }

    endorsePage() {
        return <Endorsement donor={this.props.donor} org={this.state.org_to_endorse} />
    }

    defaultPage() {
        return (
            <div className="container">
                <div>
                    <h5>Total Amount Donated</h5>
                </div>
                <div>
                    <h5>Projects Sponsored</h5>
                    <ul>
                        {this.props.sponsorships.map(function(project, idx) {
                            return <li key={idx}><ProjectBlurb project={project} /></li>
                        })}
                    </ul>
                </div>
                <div>
                    <h5>Following</h5>
                    <ul className="orgs-following">
                        {this.props.following.map(function(org, idx) {
                            return <li key={idx} className="org"><OrgBlurb org={org} endorse={this.endorse}/></li>
                        }.bind(this))}
                    </ul>
                </div>
            </div>
        )
    }

    render() {
        return (this.state.action === 'endorse') ? this.endorsePage() : this.defaultPage();
    }
}

function OrgBlurb(props) {
    // endorseOrg: function() {
    //     this.props.endorse(this.props.org._id);
    // },
    return (
        <div className="org-blurb card blue-grey darken-1">
            <div className="card-content white-text">
                <span className="card-title">{props.org.name}</span>
                <p>{`Description ${props.org.about}`}</p>
                <p>{`Followers ${props.org.followers.length}`}</p>
                <p>{`Endorsements ${props.org.endorsements.length}`}</p>
                <p>{`Projects ${props.org.projects.length}`}</p>
            </div>
            <button className="btn-endorse btn blue" onClick={(e) => { props.endorse(props.org._id) }}>Endorse</button>
        </div>
    )
}

function ProjectBlurb(props) {
    return (
        <div className="project-blurb card blue-grey darken-1">
            <div className="card-content white-text">
                <span className="card-title">{this.props.project.title}</span>
                <p>{`Description ${this.props.project.info}`}</p>
                <p>{`Start Date ${this.props.project.start_date}`}</p>
                <p>{`End Date ${this.props.project.end_date}`}</p>
                <p>{`Status ${this.props.project.status}`}</p>
                <p>{`Amount Needed ${this.props.project.amount.goal}`}</p>
                <p>{`Amount Raised ${this.props.project.amount.current}`}</p>
                <p>{`Donors ${this.props.project.total_donors_participating}`}</p>
                <p>{`Last Updated ${this.props.project.last_updated}`}</p>
            </div>
        </div>
    )
}

export class Endorsement extends Component {
    constructor(props) {
        super(props)

        this.state = { title: '', review: '' }
        this.updateTitle = this.updateTitle.bind(this)
        this.updateReview = this.updateReview.bind(this)
    }

    updateTitle(e) {
        this.setState({ title: e.target.value });
    }

    updateReview(e) {
        this.setState({ review: e.target.value });
    }

    submitEndorsement(e) {
        e.preventDefault();
        const endorsement = {
            title: this.state.title,
            review: this.state.review,
            review_date: new Date(),
            org: this.props.org,
            author: this.props.donor
        };

        $.ajax({
            method: 'POST',
            url: '/dashboard/donor/endorsement',
            data: endorsement,
            success: function(response) {
                feeder.emit('endorsement', endorsement.author, endorsement.org);
            }.bind(this),
            error: function(xhr, status, response) {
            }.bind(this)
        });
    }

    render() {
        return (
            <div>
                <form className="frm-endorsement" onSubmit={this.submitEndorsement}>
                    <label htmlFor="review-title">Title</label><br />
                    <input id="review-title" name="review-title" onChange={this.updateTitle} required />
                    <br />
                    <label htmlFor="review">Review</label>
                    <textarea className="" id="review" onChange={this.updateReview} required />
                    <input type="submit" value="Submit" className="btn blue" />
                </form>
            </div>
        )
    }
}
