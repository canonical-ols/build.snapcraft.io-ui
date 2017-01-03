import Memcached from 'memcached';

import { conf } from '../helpers/config';

let memcached = null;

const getMemcachedStub = () => {
  return {
    get: (key, callback) => callback(),
    set: (key, value, lifetime, callback) => callback()
  };
};

export const getMemcached = () => {
  const host = conf.get('MEMCACHED_HOST') ? conf.get('MEMCACHED_HOST').split(',') : null;

  if (memcached === null) {
    if (host) {
      memcached = new Memcached(host, { namespace: 'lp:' });
    } else {
      memcached = getMemcachedStub();
    }
  }
  return memcached;
};

// Test affordance.
export const setMemcached = (value) => {
  memcached = value;
};
