"use strict";

import React, { Component } from 'react';
import { CausesInfo } from '../../../causesinfo.js';

export class ProjectCreate extends Component {
    constructor(props) {
        super(props)

        this.state = {
            title: "",
            start_date: null,
            end_date: null,
            amount: {
                goal: null,
                current: 0
            },
            info: "",
            areas_of_focus: [],
            needs_list: [{
                arrIndex: 0,
                title: "",
                description: "",
                cost: null,
                quantity_needed: null,
                number_purchased: 0,
                active: "active"
            }],
            total_donors_participating: 0,
            status: "In Progress",
            is_complete: false,
            endDateText: "",
            startDateText: ""
        }
    }

    componentDidMount() {
        $('.form');
        $('.collapsible').collapsible({
            accordion: true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    }

    updateNeedTitle(need) {
        var needs = this.state.needs_list;
        needs[need.arrIndex].title = need.title;

        this.setState({ needs_list: needs });
    }

    updateNeedDescription(need) {
        var needs = this.state.needs_list;
        needs[need.arrIndex].description = need.description;

        this.setState({ needs_list: needs });
    }

    updateNeedCost(need) {
        var needs = this.state.needs_list;
        needs[need.arrIndex].cost = need.cost;

        this.setState({ needs_list: needs });
    }

    updateNeedQuantity(need) {
        var needs = this.state.needs_list;
        needs[need.arrIndex].quantity_needed = need.quantity_needed;

        this.setState({ needs_list: needs });
    }

    addNeed() {
        var arrIndex = this.state.needs_list.length;
        var needs = this.state.needs_list.slice();
        if (needs[needs.length - 1].title !== "" &&
            needs[needs.length - 1].description !== "" &&
            needs[needs.length - 1].cost !== null &&
            needs[needs.length - 1].quantity_needed !== null) {
            needs[needs.length - 1].active = "";
            needs.push({
                arrIndex: arrIndex,
                title: "",
                description: "",
                cost: null,
                quantity_needed: null,
                active: "active"
            });
            this.setState({ needs_list: needs });
        } else {
            Materialize.toast('Oops please fill in all fields', 2000, 'rounded'); // 'rounded' is the class I'm applying to the toast
        }
    }

    addRemoveCat(e) {
        var aof = this.state.areas_of_focus;
        if (e.target.checked) {
            if(aof.indexOf(e.target.value) === -1) {
                aof.push(e.target.value)
            }
        } else {
            if (aof.indexOf(e.target.value)) {
                aof.splice(aof.indexOf(e.target.value), 1);
            }
        }
        this.setState({ areas_of_focus: aof });
    }

    updateTitle(e) {
        this.setState({ title: e.target.value });
    }

    updateEndDate() {
        var self = this;
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 5, // Creates a dropdown of 15 years to control year
            // closeOnSelect: true,
            onStart() {
            },
            onRender() {
            },
            onOpen() {
            },
            onClose() {
            },
            onStop() {
            },
            onSet(e) {
                var endDate = new Date(e.select);
                var endDateText = endDate.toDateString();

                self.setState({
                    end_date: endDate,
                    endDateText: endDateText
                });
                //this.close();
            }
        });
    }

    updateStartDate() {
        const self = this;
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 5, // Creates a dropdown of 15 years to control year

            onSet(e) {
                var startDate = new Date(e.select);
                var startDateText = startDate.toDateString();

                self.setState({
                    start_date: startDate,
                    startDateText: startDateText
                });
            }
        });
    }

    updateGoalAmount(e) {
        this.setState({ amount: { goal: e.target.value } })
    }

    updateInfo(e) {
        this.setState({ info: e.target.value });
    }

    submitForm() {
        const self = this
        const projectData = this.state;
        projectData.needs_list.forEach(need => {
            delete need['active'];
        });
        delete projectData['startDateText'];
        delete projectData['endDateText'];

        $.ajax({
            url: "/dashboard/project/create",
            method: "POST",
            data: { projectData: projectData },
            success(response) {
                self.props.submitHandler(); //from projects component
            },
            error(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }
        });
    }

    render() {
        return (
            <div className="container">
            <div className="row">
            <h1>Create a new Project</h1>
            <form className="col s12">
                <div className="row">
                    {/*Project Title*/}
                    <div className="input-field col s12 m6">
                        <input id="project_title" type="text" className="validate" required value={this.state.title} onChange={this.updateTitle}/>
                        <label className={this.state.title ? "active" : ""} htmlFor="project_title">Project Title</label>
                    </div>
                    {/*Target Funding Amount*/}
                    <div className="input-field col s12 m6">
                        <input id="goal" type="number" className="validate" value={this.state.amount.goal} onChange={this.updateGoalAmount} />
                        <label className={this.state.amount.goal ? "active" : ""} htmlFor="goal">Target Funding Amount</label>
                    </div>
                </div>
                <div className="row">
                    {/*Start Date*/}
                    <div className="input-field col s12 m6">
                        <input id="start_date" type="date" className="datePicker" onClick={this.updateStartDate} />
                        <label htmlFor="start_date">Project Start Date</label>
                    </div>
                    {/*End Date*/}
                    <div className="input-field col s12 m6">
                        <input id="end_date" type="date" className="datepicker" onClick={this.updateEndDate} />
                        <label htmlFor="end_date">Projected End Date</label>
                    </div>
                </div>
                <div className="row">
                    {/*Project Info*/}
                    <div className="input-field col s12">
                        <textarea id="info" className="materialize-textarea" value={this.state.info} onChange={this.updateInfo} />
                        <label className={this.state.info ? "active" : ""} htmlFor="info">Info</label>
                    </div>
                </div>
            </form>
            <h3>Select Project Areas of Focus</h3>
            <CategorySelect addRemoveCat={this.addRemoveCat} />

            <h3>Add Project Needs</h3>
            <Needs
                needs={this.state.needs_list}
                addNeed={this.addNeed}
                updateNeedTitle={this.updateNeedTitle}
                updateNeedDescription={this.updateNeedDescription}
                updateNeedCost={this.updateNeedCost}
                updateNeedQuantity={this.updateNeedQuantity}
            />
            <a className="waves-effect waves-light btn float right" onClick={this.submitForm}><i className="material-icons right">label_outline</i>Submit</a>
            </div>
            </div>
        )
    }
}

function CategorySelect(props) {
    const majCats = CausesInfo.map((cause, index) => {
        return (
            <MajCategory
                key={index}
                causeID={cause.id}
                causeTitle={cause.title}
                causeImage={cause.img}
                causeSubcauses={cause.subcauses}
                tags={cause.tags}
                addRemoveCat={props.addRemoveCat}
            />
        );
    });

    return (
        <form className="row" action="#">
            <ul className="collapsible popout collection" data-collapsible="accordion">
                {majCats}
            </ul>
        </form>
    )
}

function MajCategory(props) {
    const minCats = props.causeSubcauses.map((subcause, index) => {
        return (
            <MinCategory
                key={index}
                subCauseID={subcause.id}
                title={subcause.title}
                tags={subcause.tags}
                addRemoveCat={props.addRemoveCat}
            />
        )
    });

    return (
        <li className="collection-item avatar white black-text">
            <div className="collapsible-header center-align">
                <img src={props.causeImage} alt={props.causeTitle} className="circle" />
                <h5>{props.causeTitle}</h5>
            </div>
            <div className="collapsible-body row white black-text">
                <div className="col s12 m4">
                    <p>
                        <input
                            type="checkbox"
                            id={props.causeID}
                            onChange={props.addRemoveCat}
                            value={props.tags}
                        />
                        <label className={props.tags ? "active" : ""} htmlFor={props.causeID} >
                            {props.causeTitle}
                        </label>
                    </p>
                </div>
                {minCats}
            </div>
        </li>
    )
}

function MinCategory(props) {
    return (
        <div className="col s12 m4">
            <p>
                <input
                    type="checkbox"
                    id={props.subCauseID}
                    onChange={props.addRemoveCat}
                    value={props.tags}
                />
                <label className={props.tags ? "active" : ""} htmlFor={props.subCauseID}>{props.title}</label>
            </p>
        </div>
    )
}

export class Needs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            needs: [{
                arrIndex: 0,
                title: "",
                description: "",
                cost: null,
                quantity_needed: null,
                active: "active"
            }]
        }
    }

    render() {
        const needsLength = this.props.needs.length - 1;
        const needs = this.props.needs.map((need, index) => {
            return (
                <Need
                    key={index}
                    arrIndex={need.arrIndex}
                    needTitle={need.title}
                    needDescription={need.description}
                    needCost={need.cost}
                    needQuantityNeeded={need.quantity_needed}
                    active={need.active}
                    last={needsLength === index}
                    addNeed={this.props.addNeed}
                    updateNeedTitle={this.props.updateNeedTitle}
                    updateNeedDescription={this.props.updateNeedDescription}
                    updateNeedCost={this.props.updateNeedCost}
                    updateNeedQuantity={this.props.updateNeedQuantity}
                />
            )
        });

        return (
            <ul className="collapsible popout" data-collapsible="accordion">
                {needs}
            </ul>
        )
    }
}

export class Need extends Component {
    constructor(props) {
        super(props)

        this.state = {}
        this.updateNeedTitle = this.updateNeedTitle.bind(this)
        this.udpateNeedDescription = this.udpateNeedDescription.bind(this)
        this.updateNeedCost = this.updateNeedCost.bind(this)
        this.updateNeedQuantity = this.updateNeedQuantity.bind(this)
    }

    updateNeedTitle(e) {
        var need = {
            arrIndex: this.props.arrIndex,
            title: e.target.value
        };
        this.props.updateNeedTitle(need);
    }

    updateNeedDescription(e) {
        var need = {
            arrIndex: this.props.arrIndex,
            description: e.target.value
        };
        this.props.updateNeedDescription(need);
    }

    updateNeedCost(e) {
        var need = {
            arrIndex: this.props.arrIndex,
            cost: e.target.value
        };
        this.props.updateNeedCost(need);
    }

    updateNeedQuantity(e) {
        var need = {
            arrIndex: this.props.arrIndex,
            quantity_needed: e.target.value
        };
        this.props.updateNeedQuantity(need);
    }

    componentWillMount() {
        $('.tooltipped').tooltip('remove');
    }

    componentDidMount() {
        $('.tooltipped').tooltip({delay: 20});
        $('input#need_description ').characterCounter();
    }

    render() {
        return (
            <li className={this.props.active}>
                {/*Form Header*/}
                <div className={"collapsible-header " + this.props.active}>
                    <i className="material-icons">filter_drama</i>
                    <strong>{this.props.needTitle !== "" ? this.props.needTitle : "Create a Need"}</strong>
                    {this.props.active === "active" ?  <a className="btn-flat waves-effect waves-light right tooltipped" data-position="top" data-delay="20" data-tooltip="Add another need" onClick={this.props.addNeed}><i className="material-icons">library_add</i></a> : ""}
                </div>

                {/*Form Body*/}
                <div className="collapsible-body">
                    <div className="row">
                        <form className="container">
                            {/*Need Title*/}
                            <div className="row">
                                <div className="input-field col s12">
                                <input
                                    value={this.props.needTitle}
                                    onChange={this.updateNeedTitle}
                                    id="need_title"
                                    type="text"
                                    className="validate"
                                    maxLength="20"
                                />
                                <label className={this.props.needTitle ? "active" : ""} htmlFor="need_title">Need Title</label>
                                </div>
                            </div>

                            {/*Need Description*/}
                            <div className="row">
                                <div className="input-field col s12">
                                <input
                                    value={this.props.needDescription}
                                    onChange={this.updateNeedDescription}
                                    id="need_description"
                                    type="text"
                                    maxLength="120"
                                />
                                <label className={this.props.needDescription ? "active" : ""} htmlFor="need_description">Need Description</label>
                                </div>
                            </div>

                            {/*Need Cost*/}
                            <div className="row">
                                <div className="input-field col s12">
                                <input
                                    value={this.props.needCost}
                                    onChange={this.updateNeedCost}
                                    id="need_cost"
                                    type="number"
                                    className="validate"
                                    maxLength="6"
                                />
                                <label className={this.props.needCost ? "active" : ""} htmlFor="need_cost">Need Cost</label>
                                </div>
                            </div>

                            {/*Need Quantity*/}
                            <div className="row">
                                <div className="input-field col s12">
                                <input
                                    value={this.props.needQuantityNeeded}
                                    onChange={this.updateNeedQuantity}
                                    id="need_quantity"
                                    type="number"
                                    className="validate"
                                    maxLength="5"
                                />
                                <label className={this.props.needQuantityNeeded ? "active" : ""} htmlFor="need_quantity">Need Quantity</label>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </li>
        )
    }
}
