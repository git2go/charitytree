"use strict";

import React, { Component } from 'react';
// import { History } from 'react-router';
import LocalStorageMixin from 'react-localstorage';

class Tag extends Component {
    constructor(props) {
        super(props)

        this.removeTag = this.removeTag.bind(this)
    }

    removeTag(e) {
        if (window.location.pathname === "/browse") {
            this.props.removeBrowseTag(e.target.textContent);
        } else if (window.location.pathname === "/search") {
            this.props.removeSearchTag(e.target.textContent);
        }
    }

    render() {
        return(
            <div className="chipx hoverable tag-hand" textContent={this.props.text} onClick={(e) => { this.removeTag(e) }}>
                <i className="fa fa-close" />
                {this.props.text}
            </div>
        );
    }
}

const TagContainer = function(props) {
    let tagNodes;
    if (props.searchCriteria.length > 0) {
        tagNodes = props.searchCriteria.map((tag, idx) => {
            return (
                <Tag text={tag}
                    removeBrowseTag={props.removeBrowseTag}
                    removeSearchTag={props.removeSearchTag}
                    key={idx}
                />
            )
        });
    }

    return (
        <div className="taglist">
            { tagNodes ? tagNodes : ""}
        </div>
    );
}

module.exports = { Tag, TagContainer }
