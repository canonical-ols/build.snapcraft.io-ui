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

export const repoAddState = {
  owners: {},
  repos: {
    1001: {
      error: null,
      isFetching: true,
      isSelected: true
    }
  },
  snaps: {}
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

export const repoFailureState = {
  owners: {},
  repos: {
    1001: {
      error: 'something went wrong',
      isFetching: false,
      isSelected: true
    }
  },
  snaps: {}
};

export const repoResetState = {
  repos: {
    1001: {
      error: null,
      isFetching: false,
      isSelected: false
    }
  },
  owners: {},
  snaps: {}
};

export const finalState = {
  ...initialState,
  ...payload.entities
};
