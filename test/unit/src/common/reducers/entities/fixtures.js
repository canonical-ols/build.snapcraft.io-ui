export const initialState = {
  repos: {},
  snaps: {},
  owners: {}
};

export const payload = {
  entities: {
    repos: {
      1001: {
        owner: 1,
        fullName: 'foo'
      },
      1002: {
        owner: 1,
        fullName: 'bar'
      },
      1003: {
        owner: 1,
        fullName: 'baz'
      }
    },
    owners: {
      1: {
        name: 'Canonical'
      }
    }
  },
  result: [ 1001,1002,1003 ]
};

export const reposPayload = {
  id: 1001
};

export const repoSuccessState = {
  owners: {},
  repos: {
    1001: {
      error: null,
      isFetching: false,
      isSelected: false
    }
  },
  snaps: {}
};

export const repoResetState = {
  owners: {},
  repos: {
    1001: {
      error: null,
      isFetching: false,
      isSelected: false
    }
  },
  snaps: {}
};

export const finalState = {
  ...initialState,
  ...payload.entities
};
