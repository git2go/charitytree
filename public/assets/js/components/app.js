import React, { Component } from 'react';
import { browserHistory } from 'react-router';
// var LocalStorageMixin = require('react-localstorage');
import { loggedIn } from '../routes.js';
import Navbar from './navbar';

export default class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loggedIn: false,
            searchText: "",
            searchCriteria: [],
            searchResults: [],
            projectId: "",
            orgId: "",
            currentOrganization: null,
            currentProject: null,
            userType: ''
        }

        this.setUserType = this.setUserType.bind(this)
        this.updateSearchCriteria = this.updateSearchCriteria.bind(this)
        this.updateInput = this.updateInput.bind(this)
        this.removeBrowseTag = this.removeBrowseTag.bind(this)
        this.removeSearchTag = this.removeSearchTag.bind(this)
        this.handleSearchButton = this.handleSearchButton.bind(this)
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
        this.getProject = this.getProject.bind(this)
        this.setProject = this.setProject.bind(this)
        this.setOrganization = this.setOrganization.bind(this)
    }

    isLoggedIn() {
        this.setState({ loggedIn: loggedIn() });
    }

    setUserType(e) {
        this.setState({ userType: e.target.value });
        browserHistory.push('/signup');
    }

    componentDidMount() {
        if (this.state.searchText && window.location.pathname === "/search") {
            this.handleSearchSubmit();
        }
    }

    updateSearchCriteria(tags) {
        this.setState({ searchCriteria: tags })
    }

    updateInput(searchText) {
        this.setState({ searchText: searchText })
    }

    removeBrowseTag(tagName) {
        var searchCriteria = this.state.searchCriteria.slice();
        var tagIdx = searchCriteria.indexOf(tagName);
        searchCriteria.splice(tagIdx, 1);
        this.setState({ searchCriteria: searchCriteria })
    }

    removeSearchTag(tagName) {
        var searchCriteria = this.state.searchCriteria.slice();
        var tagIdx = searchCriteria.indexOf(tagName);
        searchCriteria.splice(tagIdx, 1);
        var searchText = "";
        if (searchCriteria.length > 0) {
            searchText = searchCriteria.join(" ");
        }

        this.setState({ searchText: searchText, searchCriteria: searchCriteria });
        var self = this;
        var i = setInterval(function () {
            if (searchCriteria === self.state.searchCriteria) {
                clearInterval(i);
                self.handleSearchSubmit();
            }
        }, 100);
    }

    handleSearchButton(searchText) {
        this.setState({ searchText: searchText });
        var self = this;
        var i = setInterval(function () {
            if (searchText === self.state.searchText) {
                clearInterval(i);
                self.handleSearchSubmit();
            }
        }, 100);
    }

    handleSearchSubmit() {
        if (this.state.searchText) {
            var searchCriteria = this.state.searchText.split(" ");
            $.ajax({
                url: "/search",
                // dataType: 'json',
                method: "POST",
                data: {aofs: searchCriteria},
                success: function (data) {
                    this.setState({
                        searchText: this.state.searchText,
                        searchCriteria: searchCriteria,
                        searchResults: data.results
                    });
                    browserHistory.push('/search');

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
    }

    getProject(projectId) {
        this.setState({ projectId: projectId });
        var self = this;
        var i = setInterval(function () {
            if (projectId === self.state.projectId) {
                clearInterval(i);
                browserHistory.push('/project');
            }
        }, 100);
    }

    setProject(project) {
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
    }

    setOrganization(org) {
        this.setState({
            searchText: this.state.searchText,
            searchCriteria: this.state.searchCriteria,
            searchResults: this.state.searchResults,
            projectId: this.state.projectId,
            orgId: this.state.orgId,
            currentOrganization: org
        })

        this.navigateToOrganizationPage();
    }

    render() {
        return (
            <div>
                <Navbar
                    loggedIn={this.state.loggedIn}
                    isLoggedIn={this.isLoggedIn}
                    searchText={this.state.searchText}
                    updateInput={this.updateInput}
                    handleSearchSubmit={this.handleSearchSubmit}
                />
                {React.cloneElement(this.props.children, Object.assign({
                    setUserType: this.setUserType,
                    isLoggedIn: this.isLoggedIn,
                    updateSearchCriteria: this.updateSearchCriteria,
                    updateInput: this.updateInput,
                    removeSearchTag: this.removeSearchTag,
                    removeBrowseTag: this.removeBrowseTag,
                    getProject: this.getProject,
                    setProject: this.setProject,
                    setOrganization: this.setOrganization,
                    handleSearchButton: this.handleSearchButton,
                    handleSearchSubmit: this.handleSearchSubmit
                }, this.state))}
            </div>
        )
    }
}
