"use strict";

import React from 'react';

export default function Endorsement(props) {
    return (
        <ul>
            {props.endorsements.map((endorsement, idx) => {
              return (
                <li key={idx}>
                  <p>{`Title: ${endorsement.title}`}</p>
                  <p>{`Review: ${endorsement.review}`}</p>
                  <p>{`Date: ${endorsement.review_date}`}</p>
                </li>
              )
            })}
        </ul>
    )
}
