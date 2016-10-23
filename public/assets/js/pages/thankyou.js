import React, { Component } from 'react';
import { Link } from 'react-router';

export default class ThankYou extends Component {
    handleClick() {
        this.props.browserHistory.push('/dashboard');
    }

    render() {
        return (
            <div className="container center">
                <h4>Thank you so much for your donation!</h4>
                <button className="waves-effect waves-light btn light-blue darken-3" onClick={this.handleClick}>
                    Return To Dashboard
                </button>
            </div>
        );
    }
}
