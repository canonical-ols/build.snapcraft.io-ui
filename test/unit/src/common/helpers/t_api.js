import expect from 'expect';

import { getAuthHeader } from '../../../../../src/common/helpers/api';

describe('api helpers', () => {
  context('getAuthHeader', () => {
    it('is a Macaroon with root and discharge', () => {
      const header = getAuthHeader('root', 'discharge');
      expect(header).toEqual('Macaroon root="root", discharge="discharge"');
    });
  });
});
