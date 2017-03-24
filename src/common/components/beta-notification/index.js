import React, { Component } from 'react';

import Notification from '../vanilla/notification';

const SURVEY_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSeCAKWHb4w-iNrg-YqyiRVMHULDlZMx9bXyK9a7s40sXYjQzQ/viewform?usp=sf_link';

export default class BetaNotification extends Component {
  constructor() {
    super();

    this.state = {
      notificationVisible: true
    };
  }

  onRemoveClick(event) {
    event.preventDefault();

    this.setState({
      notificationVisible: false
    });
  }

  render() {
    return this.state.notificationVisible
      ? (
        <Notification onRemoveClick={this.onRemoveClick.bind(this)}>
          Hey, got a spare five minutes to <a href={SURVEY_LINK} target="_blank" rel="noopener noreferrer"> give us some feedback</a>?
        </Notification>
      )
      : null;
  }
}
