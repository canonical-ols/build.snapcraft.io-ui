import React, { PropTypes } from 'react';

import { Row, Data, Dropdown } from '../../vanilla/table-interactive';
import Button from '../../vanilla/button';
import { WarningIcon } from '../icons';

import styles from './dropdowns.css';

const getRemoveWarningMessage = (latestBuild, registeredName) => {
  let warningText;
  if (latestBuild) {
    warningText = (
      'Removing this repo will delete all its builds and build logs.'
    );
  } else {
    warningText = (
      'Are you sure you want to remove this repo from the list?'
    );
  }
  if (registeredName !== null) {
    warningText += ' The name will remain registered.';
  }
  // XXX cjwatson 2017-02-28: Once we can get hold of published states for
  // builds, we should also implement this design requirement:
  //   Separately, if any build has been published, the text should end
  //   with:
  //     Published builds will remain published.

  return warningText;
};

const RemoveRepoDropdown = (props) => {
  const { latestBuild, registeredName, onCancelClick, onRemoveClick } = props;

  return (
    <Dropdown>
      <Row>
        <Data col="100">
          <WarningIcon /> { getRemoveWarningMessage(latestBuild, registeredName) }
        </Data>
      </Row>
      <Row>
        <div className={ styles.buttonRow }>
          <a
            onClick={ onCancelClick }
            className={ styles.cancel }
          >
            Cancel
          </a>
          <Button
            appearance="negative"
            onClick={ onRemoveClick }
          >
            Remove
          </Button>
        </div>
      </Row>
    </Dropdown>
  );

};

RemoveRepoDropdown.propTypes = {
  latestBuild: PropTypes.object,
  registeredName: PropTypes.string,
  onRemoveClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired
};

export default RemoveRepoDropdown;
