import React from 'react';
import { Link, History } from 'react-router';
import { DonateNeeds } from './needs.js';
exports.Donate = React.createClass({

  getInitialState: function () {
    return {
      project: {},
      needs_list: [],
      quantityTotal: 0,
      donationTotal: 0
    };
  },

  updateNumberPurchased: function (need) {
    var needs = this.state.needs_list;
    var originalQuantityNeeded = this.state.project.needs_list[need.arrIndex].quantity_needed;
    needs[need.arrIndex].number_purchased = Number(need.number_purchased);
    needs[need.arrIndex].quantity_needed = originalQuantityNeeded - need.number_purchased;
    this.setState({
      needs_list: needs
    });
    this.updateTotals();
  },

  updateTotals: function () {
    var quantityTotal = this.state.needs_list.map(function (need) {
      return need.number_purchased || 0;
    }).reduce(function (previous, current) {
      return previous += current;
    }, 0);
    var donationTotal = this.state.needs_list.map(function (need) {
      return need.cost * need.number_purchased || 0;
    }).reduce(function (previous, current) {
      return previous += current;
    }, 0);
    this.setState({
      quantityTotal: quantityTotal,
      donationTotal: donationTotal
    });
  },

  componentDidMount: function () {
        $.ajax({
      url:'/project_get/'+localStorage.currentProjID,
      method: "GET",
      success: function (data) {
        var needs_list = JSON.parse(JSON.stringify(data.results.needs_list));
        needs_list = needs_list.map(function (need) {
          need.number_purchased = 0;
          return need;
        });
        this.setState({
          project: data.results,
          needs_list: needs_list
        });
        $('input#cc_number, input#csc').characterCounter();
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(xhr, status, err.toString());
      }.bind(this)
    });
  },

  handleSubmit: function(e){
    //this whole function runs once the send button is clicked

    e.preventDefault();


    var copy = JSON.stringify(this.state.needs_list.slice());

    //creating a copy of the needs list for donor reciept
    var recipeCopy = JSON.parse(copy);

    //creating updating purchase amount in each need to 0 before sending
    var update = JSON.parse(copy);
    update.forEach(function(need){
      need.number_purchased = 0;
    });

    //creating a copy of project to send back to DB
    var holder = JSON.stringify(this.state.project);
    var project = JSON.parse(holder);

    //putting updated needs list in project that will be sent back to DB
    project.needs_list = update;

    //updating amount property in project that will be sent back to DB
    if(project.amount.current){
      project.amount.current += this.state.donationTotal;
    }else{
      project.amount.current = this.state.donationTotal;
    }

    //creating Object that will be sent back to DB to update proj in DB
    var readyToShip = {
      _id: project._id,
      amount: project.amount,
      needs_list: project.needs_list
    };


    // Post to Database for updating. When ready to test place endpoint in URL
    // this whole function runs once the send button is clicked
    $.ajax({
      type: "POST",
      url: '/dashboard/project/needs/update',
      dataType: 'json',
      data: readyToShip,
      success: function(data) {
        feeder.emit('donation', localStorage.token, readyToShip._id, this.state.donationTotal);
        this.props.history.pushState(null, `/thankyou`);
      }.bind(this),
      error: function(err){
        
      }
    });
  },

  render: function () {
    if(this.state.project) {
      if (this.state.needs_list.length > 0) {
        var needs = this.state.needs_list.map(function (need, index) {
          return (
            <DonateNeeds
              key={index}
              arrIndex={index}
              title={need.title}
              description={need.description}
              cost={need.cost}
              originalQuantityNeeded={this.state.project.needs_list[index].quantity_needed}
              quantity_needed={need.quantity_needed}
              number_purchased={need.number_purchased}
              updateNumberPurchased={this.updateNumberPurchased}/>
          );
        }.bind(this));
      }
    }
    return(
      <div className="container">
        <h4 className="center-align">Select the quantity of each need you would like to contribute to:</h4>

        {/*Totals*/}
        <div className="row">
          <div className="col s4">
            <h4>{this.state.project.title}</h4>
          </div>
          <div className="col s4">
            <h5>Total Quantity: {this.state.quantityTotal}</h5>
          </div>
          <div className="col s4 right-align">
            <h5>Total Donation: ${this.state.donationTotal}</h5>
          </div>
        </div>

        {/*Needs Form*/}
        <form  onSubmit={this.handleSubmit}>
          {needs ? needs : <div>Nothing to display</div>}
          {/*Additional Donation*/}
          <div className="row">
            <label htmlFor="additional_donation">Specify Additional Donation Amount</label>
            <div className="input-field col s12">
              <input id="additional_donation" type="number" min="0" className="validate"/>
            </div>
          </div>

          {/*Totals*/}
          <div className="row">
            <div className="col s4">
              <h4>{this.state.project.title}</h4>
            </div>
            <div className="col s4">
              <h5>Total Quantity: {this.state.quantityTotal}</h5>
            </div>
            <div className="col s4 right-align">
              <h5>Total Donation: ${this.state.donationTotal}</h5>
            </div>
          </div>

          {/*Payment Form*/}
          <div className="container">
            <div className="row">
              <div className="input-field col s12">
                <input id="cc_number" type="number" max="9999999999999999999" className="validate"/>
                <label htmlFor="number">Card Number</label>
              </div>
            </div>
            <div className="row">
              <div className="col s12">
                <div className="row">
                  <div className="input-field col s6">
                    <input id="expiration" type="text" className="validate"/>
                    <label htmlFor="expiration">Expiration Date</label>
                  </div>
                  <div className="input-field col s6">
                    <input id="csc" type="number" max="999" className="validate"/>
                    <label htmlFor="csc">CSC(3-digits)</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="address" type="text" className="validate"/>
                    <label htmlFor="address">Address</label>
                  </div>
                </div>
              </div>
            </div>
            <a className="waves-effect waves-light btn right-align" onClick={this.handleSubmit}><i className="material-icons left">send</i>Submit</a>
          </div>

        </form>
      </div>
    );
  }
});
