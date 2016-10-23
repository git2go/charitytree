"use strict";

import React from 'react';
import { Link } from 'react-router';


export default function Footer(props) {
    return (
        <footer className="page-footer grey lighten-5">
            <div className="container center-align">
                <div className="row">
                    <div className="col m3 s12">
                        <h5 className="brand-logo blue-text thin accent-3">Charity Tree</h5>
                        <p className="grey-text">Making Giving Personal!</p>
                    </div>
                    <div className="col m6 s12">
                        <h5 className="black-text thin">Development Team</h5>
                        <ul>
                            <li><p>Project Owner/Developer: Andrew Howes</p></li>
                            <li><p>Scrum Master/Developer: Zach Herries</p></li>
                            <li><p>Developer: Seyi Dodo-Williams</p></li>
                            <li><p>Developer: Marcus Milton-Ellis</p></li>
                        </ul>
                    </div>
                    <div className="col m3 s12">
                        <h5 className="black-text thin">Links</h5>
                        <ul>
                            <li>
                                <Link className="waves-effect waves-light black-text thin" to="/" className="black-text text-lighten-3">Home</Link>
                            </li>
                            <li>
                                <Link className="waves-effect waves-light black-text thin" to="search" className="black-text text-lighten-3">Search</Link>
                            </li>
                            <li>
                                <Link className="waves-effect waves-light black-text thin" to="browse" className="black-text text-lighten-3">Browse</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-copyright">
                <div className="container black-text">
                    <p className="left">© 2015 Charity Collective</p>
                </div>
            </div>
        </footer>
    );
}
