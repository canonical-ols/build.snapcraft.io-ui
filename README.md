# build.snapcraft.io

Snapcraft Build site.

## Local development

First, make sure all dependencies are installed:

``` bash
npm install
```

### Pre-requisites
Before you start the development site, you need to set up test accounts with **GitHub** and **Launchpad** to test with.

#### GitHub
To connect to GitHub itself, you will need to create a "client id" and "client secret" to allow the application to authenticate itself.

Go and [register a new OAuth application](https://github.com/settings/applications/new) in your GitHub account. You can fill in the form however you want, the only important detail is that you set the "Authorization callback URL" to `http://localhost:8000/auth/verify`.

Once you've created the application, you should be given the client id and the client secret. **Make a note of these**.

Additionally, if the intention is to run the GitHub repository poller (`npm run poll-repositories`), a API token should be acquired so the API calls are submitted to an acceptable rate-limit (5k req/s instead of 60 req/s for anonymous access)::

  curl -s -u '<GH_USER>' https://api.github.com/authorizations \
    -H 'Content-Type: application/json' \
    -H 'X-GitHub-OTP: <GH 2FA CODE IF ENABLED>' \
    -d '{"client_id": "c54ee622a3fa9622701f", \
         "client_secret": "2a6010d06c7c90b1fcf6518d72eac0bab64cf35b", \
	 "note": "Build.s.io poller token"}' | jq '.token' -r

`curl` will ask for you GitHub password (basic-auth) and acquire a 40-char authorization token. Make note of it, it should be set in the running environment as `GITHUB_AUTH_CLIENT_TOKEN`.


#### Launchpad

To connect to Launchpad, you need to set up a **username**, a **consumer key** and obtain an **API token** and an **API token secret**::

  ./scripts/create-launchpad-credentials
  ...

It will print the details needed in the next section, for filling your environment file.

If you need complete instructions for obtaining these details, they can be found [here](https://help.launchpad.net/API/SigningRequests).


#### Env file
To use the credentials from GitHub and Launchpad, you need to create an **env file**.

```
atom environments/dev.env
```

Paste the following into the file and fill in the missing values:

```
LP_API_URL=
LP_API_USERNAME=
LP_API_CONSUMER_KEY=
LP_API_TOKEN=
LP_API_TOKEN_SECRET=
GITHUB_AUTH_CLIENT_ID=
GITHUB_AUTH_CLIENT_SECRET=
GITHUB_AUTH_CLIENT_TOKEN=
```

You should now have all the configuration necessary for starting the development site.

### Start the dev server

To start the development server:

```
npm start -- --env=environments/dev.env
```

After about 20 seconds, the web application should be available at <http://127.0.0.1:8000>.


### Run the repository poller script

```
npm run poll-repositories -- --env=environments/dev.env
```

## lxd container setup

To locally reproduce the ols jenkaas setup, a local lxd container can be
created on ubuntu with the python3-ols-vms package from the
ubuntuone/ols-tests PPA:

```
$ ols-vms setup [--force] build-snapcraft-io
$ ols-vms shell build-snapcraft-io
ubuntu@build-snapcraft-io:~$ git clone git://github.com/canonical-ols/build.snapcraft.io.git work
ubuntu@build-snapcraft-io:~$ cd work
ubuntu@build-snapcraft-io:~/work$ npm install
ubuntu@build-snapcraft-io:~/work$ npm test
```

## emacs

Emacs is confused if 'build.snapcraft.io' is used in the project directory
name, using 'build-snapcraft-io' restores sanity.

## Updating dependencies

Managing dependencies with npm can be a little .... interesting, especially if
you're not used to the peculiarities of the nodejs toolchain.

First, you must add or update the dependency in package.json. This file
contains both a 'dependencies' section (for run-time dependencies) and a
'devDependencies' section (for build-time dependencies). Edit the appropriate
section to add/remove/edit the dependencies that you care about. Version
numbers are specified using a [special syntax](https://docs.npmjs.com/misc/semver#prerelease-identifiers).

Next, run `npm update` to get the new dependencies locally.

Finally, run `./node_modules/shonkwrap/shonkwrap` (I wish I was joking) to
update the `npm-shrinkwrap.json` file with the new frozen dependency set.
The `shonkwrap` command wraps `npm shrinkwrap`, but removes the 'resolved'
keys from the final shrinkwrapped file.
