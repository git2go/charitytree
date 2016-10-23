"use strict";

import React, { Component } from 'react';
import { browserHistory } from 'react-router';

export default class Signup extends Component {
    constructor(props) {
        super(props)

        this.state = { userType: '', errorMsg: '' }

        this.showOrgSignupForm = this.showOrgSignupForm.bind(this)
        this.showDonorSignupForm = this.showDonorSignupForm.bind(this)
        this.navigateToDashboard = this.navigateToDashboard.bind(this)
    }

    componentWillMount() {
        if (!this.props.userType) {
            this.setState({ userType: localStorage.getItem('ct_userType') });
        }
    }

    componentDidMount() {
        if (this.props.userType) {
            localStorage.setItem("ct_userType", this.props.userType);
        }
    }

    showOrgSignupForm() {
        return (
            <div className="div-signup-form">
                <form id="signupForm" className="col s12" onSubmit={this.signup}>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="org_name">Organization Name</label>
                            <input type="text" id="org_name" name="org_name" ref="org_name" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" name="username" ref="username" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="pwd">Password</label>
                            <input type="password" id="pwd" name="pwd" ref="pwd" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="pwd2">Re-enter Password</label>
                            <input type="password" id="pwd2" name="pwd2" ref="pwd2" required />
                        </div>
                    </div>
                    {this.state.errorMsg ? <p style={signupError}>{this.state.errorMsg}</p> : ''}
                    <div className="row">
                        <input className="waves-effect waves-light btn blue" type="submit" value="Submit" />
                    </div>
                </form>
            </div>
        )
    }

    showDonorSignupForm() {
        return (
            <div className="div-signup-form col s12">
                <form id="signupForm" className="col s12" onSubmit={this.signup}>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="first_name">First Name</label>
                            <input type="text" id="first_name" name="first_name" ref="first_name" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="last_name">Last Name</label>
                            <input type="text" id="last_name" name="last_name" ref="last_name" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" ref="email" required className="validate" />
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" name="username" ref="username" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="pwd">Password</label>
                            <input type="password" id="pwd" name="pwd" ref="pwd" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6">
                            <label htmlFor="pwd2">Re-enter Password</label>
                            <input type="password" id="pwd2" name="pwd2" ref="pwd2" required />
                        </div>
                    </div>
                    {this.state.errorMsg ? <p style={signupError}>{this.state.errorMsg}</p> : ''}
                    <div className="row">
                        <input className="waves-effect waves-light btn blue" type="submit" value="Submit" />
                    </div>
                </form>
            </div>
        )
    }

    navigateToDashboard() {
        browserHistory.push('/dashboard');
    }

    signup(e) {
        const self = this;
        e.preventDefault();
        if (ReactDOM.findDOMNode(this.refs.pwd).value !== ReactDOM.findDOMNode(this.refs.pwd2).value) {
            this.setState({ errorMsg: 'Passwords did not match' });
            return;
        }

        const formData = {};
        const userType = this.state.userType ? this.state.userType : this.props.userType;
        if (userType === 'Organization') {
            formData.org_name = ReactDOM.findDOMNode(this.refs.org_name).value;
            formData.username = ReactDOM.findDOMNode(this.refs.username).value;
            formData.pwd = ReactDOM.findDOMNode(this.refs.pwd).value;
            formData.userType = userType;
        }

        if (userType === 'Donor') {
            formData.first_name = ReactDOM.findDOMNode(this.refs.first_name).value;
            formData.last_name = ReactDOM.findDOMNode(this.refs.last_name).value;
            formData.email = ReactDOM.findDOMNode(this.refs.email).value;
            formData.username = ReactDOM.findDOMNode(this.refs.username).value;
            formData.pwd = ReactDOM.findDOMNode(this.refs.pwd).value;
            formData.userType = userType;
        }

        $.ajax({
            type: 'POST',
            url: '/auth/signup',
            data: formData,
            success: function(response) {
                localStorage.token = response.token;
                self.props.isLoggedIn();
                self.navigateToDashboard();
            },
            error: function(xhr, status, err) {
                if (xhr.status === 401) {
                    self.setState({ errorMsg: "Username is already taken" });
                }
                if (xhr.status === 500) {
                    self.setState({ errorMsg: "Signup Error. Please try again later." });
                }
            }
        });
    }

    render() {
        const userType = this.state.userType ? this.state.userType : this.props.userType;
        if (userType === 'Organization') {
            return this.showOrgSignupForm();
        } else if (userType === 'Donor') {
            return this.showDonorSignupForm();
        }
        return <div></div>
    }
}

/* Inline Styles */
const signupError = {
    fontWeight: 'bold',
    color: 'red'
}
