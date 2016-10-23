"use strict";

import React, { Component } from 'react';

export class DonorProfile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            editing: false,
            donorInfo: {}
        }

        this.update = this.update.bind(this)
        this.editPage = this.editPage.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.editMode = this.editMode.bind(this)
        this.displayMode = this.displayMode.bind(this)
    }

    componentWillReceiveProps(newProps) {
        this.setState({ donorInfo: newProps.donorInfo, editing: false });
    }

    update(formData) {
        const self = this
        $.ajax({
            method: 'POST',
            url: '/dashboard/profile',
            data: formData,
            success: function(response) {
                feeder.emit('profile_update', response.results.username);
                // this.setState({ donorInfo: response.results, editing: false });
                self.props.update_db_state_prop({
                    'name': response.results.name,
                    'email': response.results.email,
                    'areas_of_focus': response.results.areas_of_focus
                });
            },
            error: function(error) {
            }
        });
    }

    editPage(e) {
        e.preventDefault();
        this.setState({ editing: true });
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = {
            name: {
                first: ReactDOM.findDOMNode(this.refs.first_name).value,
                last: ReactDOM.findDOMNode(this.refs.last_name).value
            },
            email: ReactDOM.findDOMNode(this.refs.email).value,
            areas_of_focus: (ReactDOM.findDOMNode(this.refs.aofs).value).trim()
            .replace(/;\s*|\s|\r\n|\r|\n/g,"/b$117/").split("/b$117/")
        };
        this.update(formData);
    }

    displayMode() {
        const donorInfo = Object.keys(this.state.donorInfo).length ? this.state.donorInfo : this.props.donorInfo;
        return (
            <div className="container">
                <div className="float-left">
                    <h5>About</h5>
                    <h3>{donorInfo.name.first + ' ' + donorInfo.name.last}</h3>
                    <h6>{'@'+donorInfo.username}</h6>
                    <p>{donorInfo.email}</p>
                    <h5>Areas of Focus</h5>
                    <ul>
                        {donorInfo.areas_of_focus.map((aof, idx) => {
                            return (
                                <li key={idx}><i className="tiny material-icons">label</i>{aof}</li>
                            );
                        })}
                    </ul>
                    <button className="waves-effect waves-light btn blue"onClick={this.editPage}>Edit</button>
                </div>
            </div>
        )
    }

    editMode() {
        const donorInfo = Object.keys(this.state.donorInfo).length ? this.state.donorInfo : this.props.donorInfo;
        return (
            <div className="float-left">
                <h5>Profile</h5>
                <div className="div-profile-edit-form">
                    <form id="profileEdit" className="col s12" onSubmit={this.handleSubmit}>
                        <div className="row">
                            <div className="input-field col s6">
                                <label htmlFor="first_name"></label>
                                <input type="text" id="first_name" name="first_name" ref="first_name" defaultValue={donorInfo.name.first} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s6">
                                <label htmlFor="last_name"></label>
                                <input type="text" id="last_name" name="last_name" ref="last_name"defaultValue={donorInfo.name.last} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s6">
                                <label htmlFor="email"></label>
                                <input className="validate" type="email" id="email" name="email" ref="email" defaultValue={donorInfo.email} required />
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-field col s12">
                                <label htmlFor="aofs"></label>
                                <textarea id="aofs" className="materialize-textarea" ref="aofs" defaultValue={donorInfo.areas_of_focus.join("; ")}/>
                            </div>
                        </div>
                        <input type="submit" value="Submit" className="waves-effect waves-light btn blue"/>
                    </form>
                </div>
            </div>
        );
    }

    render() {
        return (!this.state.editing) ? this.displayMode() : this.editMode()
    }
}
