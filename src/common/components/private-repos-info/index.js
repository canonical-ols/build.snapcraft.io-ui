import React, { Component } from 'react';
import url from 'url';
import fetchJsonp from 'fetch-jsonp';

import Popover from '../popover';
import Button from '../vanilla/button';

import styles from './private-repos-info.css';

export default class PrivateReposInfo extends Component {
  constructor() {
    super();

    this.state = {
      showPopover: false,
      popoverOffsetLeft: 0,
      popoverOffsetTop: 0,
      subscribeEmail: '',
      subscribeSuccess: false,
      subscribeError: false,
      message: ''
    };
  }

  onHelpClick(event) {
    const { target } = event;

    this.setState({
      showPopover: !this.state.showPopover,
      popoverOffsetLeft: target.offsetLeft + (target.offsetWidth / 2),
      popoverOffsetTop: target.offsetTop + target.offsetHeight
    });
  }

  onEmailChange(event) {
    const { target } = event;

    this.setState({
      subscribeEmail: target.value
    });
  }

  async onSubscribeSubmit(event) {
    event.preventDefault();

    const formUrl = url.parse('https://canonical.us3.list-manage.com/subscribe/post-json');
    const submitUrl = url.format({
      ...formUrl,
      query: {
        u: '56dac47c206ba0f58ec25f314',
        id: '381f5c55f1',
        MERGE0: this.state.subscribeEmail
      }
    });

    try {
      const response = await fetchJsonp(submitUrl, { jsonpCallback: 'c' });
      const json = await response.json();

      this.setState({
        subscribeSuccess: json.result === 'success',
        subscribeError: json.result === 'error',
        message: json.msg
      });
    } catch (e) {
      this.setState({
        subscribeSuccess: false,
        subscribeError: true,
        message: e.message || 'There was unexpected error while subscribing. Please try again later.'
      });
    }
  }

  renderSubsribeForm() {
    return (
      <form onSubmit={this.onSubscribeSubmit.bind(this)}>
        <label className={styles.subscribeEmailLabel} htmlFor="subscribe_email">E-mail address:</label>
        <input
          id="subscribe_email"
          required={true}
          className={styles.subscribeEmailInput}
          type="email"
          onChange={this.onEmailChange.bind(this)}
          value={this.state.subscribeEmail}
        />
        <Button type="submit" appearance='neutral' flavour='ensmallened'>Keep me posted</Button>
        { this.state.subscribeError &&
          <p className={styles.errorMsg}>{ this.state.message }</p>
        }
      </form>
    );
  }

  render() {
    return (
      <div className={ styles.info }>
        <p>Organization and private repos not shown yet. (<a onClick={this.onHelpClick.bind(this)}>Why?</a>)</p>
        { this.state.showPopover &&
          <Popover left={this.state.popoverOffsetLeft} top={this.state.popoverOffsetTop}>
            <p className={styles.infoMsg}>We’re working hard on making these buildable. If you like, we can e-mail you when we’re ready.</p>
            { this.state.subscribeSuccess
              ? <p className={styles.successMsg}>{ this.state.message }</p>
              : this.renderSubsribeForm()
            }
          </Popover>
        }
      </div>
    );
  }
}
