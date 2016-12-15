# Routes

## Launchpad snap management

Unless otherwise stated, routes return JSON responses of this form:

    {"status": "...", "payload": {"code": "...", "message": "..."}}

`status` may be `success` or `error`.

To create a snap:

    POST /launchpad/snaps
    Cookie: <session cookie>
    Content-Type: application/json
    Accept: application/json

    {
      "repository_url": "https://github.com/:account/:repo",
      "success_url": ":url"
    }

On success, returns 302 with the `Location` header set to a URL that the
user should visit to continue authorization.  This will ultimately redirect
back to the URL passed in `success_url`.

To search for an existing snap:

    GET /launchpad/snaps?repository_url=:url
    Accept: application/json

Successful responses have `status` set to `success` and `code` set to
`snap-found`; the `message` will be the URL of the snap on the Launchpad
API.
