import React, { Component } from 'react';
import { Link } from 'react-router';
import { TagContainer, Tag } from '../components/tagContainer.js';
import { CausesInfo } from '../causesinfo.js';

export default class Browse extends Component {
    constructor(props) {
        super(props)

        this.addCriteria = this.addCriteria.bind(this)
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this)
    }

    componentDidMount() {
        $('.scrollspy').scrollSpy();
    }

    addCriteria(e) {
        const tags = this.props.searchCriteria;
        if (this.props.searchCriteria.indexOf(e.target.title) === -1) {
            tags.push(e.target.title);
        }
        this.props.updateSearchCriteria(tags);
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        const searchText = this.props.searchCriteria.join(" ");
        this.props.handleSearchButton(searchText);
    }

    render() {
        return (
            <div>
                <div className="center flow-text">
                    <h3>Find causes you care about the most</h3>
                </div>
                <div className="row">
                    <div className="col s12 m2 l2">
                        <div className="center-align pinned" style={{maxWidth: "16%", zIndex: "100"}}>
                        <button
                            className="btn waves-effect waves-light light-blue darken-3"
                            type="submit"
                            name="action"
                            onClick={this.handleSearchSubmit}>
                            Submit Search
                            <i className="material-icons left">search</i>
                        </button>
                        <h6>Search Criterion</h6>
                            <TagContainer searchCriteria={this.props.searchCriteria} removeBrowseTag={this.props.removeBrowseTag} />
                        </div>
                    </div>
                    {/*Causes*/}
                    <Causes addCriteria={this.addCriteria} />
                    {/*ScrollSpy*/}
                    <ScrollSpyListItems />
                </div>
            </div>
        );
    }
}

function Causes(props) {
    const causeCards = CausesInfo.map((cause, index) => {
        return (
            <Cause
                key={index}
                causeID={cause.id}
                tags={cause.tags}
                causeTitle={cause.title}
                causeImage={cause.img}
                causeSubcauses={cause.subcauses}
                addCriteria={props.addCriteria}
            />
        )
    });

    return (
        <div className="col s9 push-s3 m8 push-m2 l8 push-l2">
            <div className="row">{causeCards}</div>
        </div>
    );
}

function Cause(props) {
    const causeCardReveals = props.causeSubcauses.map((subcause, index) => {
        return (
            <CauseCriteria
                key={index}
                title={subcause.title}
                tags={subcause.tags}
                addCriteria={props.addCriteria}
            />
        );
    })

    return (
        <div id={props.causeID} className="col s12 m6 l6 section scrollspy">
            <div className="cardx hoverable">
                <div className="card-image waves-effect waves-block waves-light">
                    <img className="image activator" src={props.causeImage} />
                    <span className="card-title activator white-text shadow">{props.causeTitle}</span>
                </div>
                <div className="card-reveal #f5f5f5 grey lighten-4">
                    <span className="card-title grey-text text-darken-4 hand" title={props.tags} onClick={props.addCriteria}>{props.causeTitle}</span>
                    <form action="#">
                        {causeCardReveals}
                    </form>
                </div>
            </div>
        </div>
    );
}

function CauseCriteria(props) {
    return (
        <div className="hand" title={props.tags} onClick={props.addCriteria}>
            {props.title}
        </div>
    );
}

function ScrollSpyListItems(props) {
    const items = CausesInfo.map((cause, index) => {
        return (
            <li key={index}>
                <a href={"#" + cause.id}>{cause.title}</a>
            </li>
        );
    });

    return (
        <div className="col hide-on-small-only m2 push-m2 l2 push-l2">
            <div className="toc-wrapper pinned" >
                <ul className="section table-of-contents">
                    {items}
                </ul>
            </div>
        </div>
    );
}
