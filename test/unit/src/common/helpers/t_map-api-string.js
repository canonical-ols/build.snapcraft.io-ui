import expect from 'expect';

import mapApiString from '../../../../../src/common/helpers/map-api-string.js';

describe('mapApiString', function() {
  it('should map defined strings', function() {
    expect(mapApiString('Needs building')).toBe('Building soon');
  });

  it('should pass through strings that have no mapping', function() {
    expect(mapApiString('Foo bar')).toBe('Foo bar');
  });
});
