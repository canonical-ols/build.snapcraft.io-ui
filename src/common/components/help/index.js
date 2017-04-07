import React from 'react';

import HelpBox from './help-box';
import HelpInstallSnap from './help-install-snap';
import HelpPromoteSnap from './help-promote-snap';

const HelpInstallSnapBox = (props) => <HelpBox><HelpInstallSnap {...props} /></HelpBox>;

export {
  HelpBox,
  HelpInstallSnap,
  HelpInstallSnapBox,
  HelpPromoteSnap
};
