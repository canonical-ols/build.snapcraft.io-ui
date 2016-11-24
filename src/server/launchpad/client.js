/* Copyright 2009-2016 Canonical Ltd.  This software is licensed under the
 * GNU Affero General Public License version 3 (see the file LICENSE).
 *
 * Utility methods and classes to deal with the Launchpad API using
 * Javascript.
 */

import 'es6-promise/auto';
import 'isomorphic-fetch';
import { OAuth } from 'oauth';
import qs from 'qs';
import url from 'url';

const HTTP_CREATED = 201;

/**
 * Converts an absolute URI into a relative URI.
 * Prepends the root to a relative URI that lacks the root.
 * Does nothing to a relative URI that includes the root.
 */
export function normalizeURI(base_uri, uri) {
  const service_base = '/api/devel';
  const base_parsed = url.parse(base_uri);
  const parsed = url.parse(uri);

  if (parsed.host !== null) {
    // e.g. 'http://www.example.com/api/devel/foo';
    // Don't try to insert the service base into what was an absolute URL.
    // So 'http://www.example.com/foo' remains unchanged.
  } else {
    if (!parsed.pathname.startsWith('/')) {
      // e.g. 'api/devel/foo' or 'foo'
      parsed.pathname = '/' + parsed.pathname;
    }
    if (!parsed.pathname.startsWith(service_base)) {
      // e.g. '/foo'
      parsed.pathname = service_base + parsed.pathname;
    }
  }

  parsed.protocol = base_parsed.protocol;
  parsed.host = base_parsed.host;

  return url.format(parsed);
}

class ResourceError extends Error {
  constructor(response, client, uri, method) {
    super(`${uri} returned HTTP status ${response.status}`);
    this.response = response;
    this.client = client;
    this.uri = uri;
    this.method = method;
  }
}

export function wrapResourceOnSuccess(response, client, uri, method) {
  const media_type = response.headers.get('Content-Type');
  if (media_type.startsWith('application/json')) {
    return response.json().then(representation => {
      // If the object fetched has a self_link, make that the object's uri
      // for use in other api methods off of that object.  During a PATCH
      // request the caller is the object.  Leave the original_uri alone.
      // Otherwise make the uri the object coming back.
      if (representation.self_link && method !== 'PATCH') {
        uri = representation.self_link;
      }
      return client.wrap_resource(uri, representation);
    });
  } else {
    return response.text();
  }
}

// The resources that come together to make Launchpad.

/** The base class for objects retrieved from Launchpad's web service. */
export class Resource {
  /** Initialize a resource with its representation and URI. */
  init(client, representation, uri) {
    this.lp_client = client;
    this.uri = uri;
    for (const key of Object.keys(representation)) {
      this[key] = representation[key];
    }
  }

  /** Get the result of a named GET operation on this resource. */
  named_get(operation_name, config) {
    return this.lp_client.named_get(this.uri, operation_name, config);
  }

  /** Trigger a named POST operation on this resource. */
  named_post(operation_name, config) {
    return this.lp_client.named_post(this.uri, operation_name, config);
  }
}

/** The root of the Launchpad web service. */
export class Root extends Resource {
  constructor(client, representation, uri) {
    super();
    this.init(client, representation, uri);
  }
}

/** A grouped collection of objects from the Launchpad web service. */
export class Collection extends Resource {
  constructor(client, representation, uri) {
    super();
    this.init(client, representation, uri);
    for (const i in this.entries.keys()) {
      const entry = this.entries[i];
      this.entries[i] = new Entry(client, entry, entry.self_link);
    }
  }

  /**
   * Retrieve a subset of the collection.
   * @param start - Where in the collection to start serving entries.
   * @param size - How many entries to serve.
   * @returns {Promise<Collection, ResourceError>}
   */
  lp_slice(start, size) {
    return this.lp_client.get(this.uri, { start: start, size: size });
  }
}

/** A single object from the Launchpad web service. */
export class Entry extends Resource {
  constructor(client, representation, uri) {
    super();
    this.lp_client = client;
    this.uri = uri;
    this.lp_attributes = {};
    this.dirty_attributes = [];

    // Copy the representation keys into our own set of attributes, and add
    // an attribute-change event listener for caching purposes.
    for (const key of Object.keys(representation)) {
      this.lp_attributes[key] = representation[key];
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get: () => { return this.lp_attributes[key]; },
        set: value => {
          if (value !== this.lp_attributes[key]) {
            this.dirty_attributes.push(key);
          }
          this.lp_attributes[key] = value;
        }
      });
    }
  }

  /** Write modifications to this entry back to the web service. */
  lp_save(config) {
    let representation = {};
    for (const attribute of this.dirty_attributes) {
      representation[attribute] = this[attribute];
    }
    let headers = {};
    if (this['http_etag'] !== undefined) {
      headers['If-Match'] = this['http_etag'];
    }
    const uri = normalizeURI(this.lp_client.base_uri, this['self_link']);
    return this.lp_client.patch(uri, representation, config, headers)
      .then(() => { this.dirty_attributes = []; });
  }
}

/** A client that makes HTTP requests to Launchpad's web service. */
export class Launchpad {
  constructor(base_uri, consumer_key, token_key, token_secret) {
    this.base_uri = base_uri;
    this.consumer_key = consumer_key;
    this.token_key = token_key;
    this.token_secret = token_secret;
  }

  makeHeaders() {
    let headers = {};
    if (this.consumer_key !== undefined &&
        this.token_key !== undefined && this.token_secret !== undefined) {
      // We leave a lot of the parameters null or empty here because
      // Launchpad uses the PLAINTEXT method which really doesn't care.
      const oauth = new OAuth(
        null, null, this.consumer_key, '', '1.0', null, 'PLAINTEXT');
      headers['Authorization'] = oauth.authHeader(
        '', this.token_key, this.token_secret);
    }
    return headers;
  }

  /**
   * Get the current state of a resource.
   * @returns {Promise<Resource|Object, ResourceError>}
   */
  get(uri, config) {
    if (config === undefined) {
      config = {};
    }
    const start = config.start;
    const size = config.size;
    const headers = {
      ...this.makeHeaders(),
      'Accept': config.accept || 'application/json'
    };
    let parameters = { ...config.parameters };
    if (start !== undefined) {
      parameters['ws.start'] = start;
    }
    if (size !== undefined) {
      parameters['ws.size'] = size;
    }
    uri = normalizeURI(this.base_uri, uri);
    if (Object.keys(parameters).length !== 0) {
      uri += '?' + qs.stringify(parameters, { indices: false });
    }

    return fetch(uri, { headers: headers }).then(response => {
      if (Math.floor(response.status / 100) == 2) {
        return wrapResourceOnSuccess(response, this, uri, 'GET');
      } else {
        throw new ResourceError(response, this, uri, 'GET');
      }
    });
  }

  /**
   * Retrieve the value of a named GET operation on the given URI.
   * @returns {Promise<Resource|Object, ResourceError>}
   */
  named_get(uri, operation_name, config) {
    if (config === undefined) {
      config = {};
    }
    config.parameters = { 'ws.op': operation_name, ...config.parameters };
    return this.get(uri, config);
  }

  /**
   * Perform a named POST operation on the given URI.
   * @returns {Promise<Resource|Object, ResourceError>}
   */
  named_post(uri, operation_name, config) {
    if (config === undefined) {
      config = {};
    }
    uri = normalizeURI(this.base_uri, uri);
    const headers = {
      ...this.makeHeaders(),
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };
    const parameters = { 'ws.op': operation_name, ...config.parameters };

    return fetch(uri, {
      method: 'POST',
      headers: headers,
      body: qs.stringify(parameters, { indices: false })
    }).then(response => {
      if (response.status === HTTP_CREATED) {
        // A new object was created as a result of the operation.  Get that
        // object instead.
        var new_location = response.headers.get('Location');
        return this.get(new_location, {});
      } else if (Math.floor(response.status / 100) == 2) {
        return wrapResourceOnSuccess(response, this, uri, 'POST');
      } else {
        throw new ResourceError(response, this, uri, 'POST');
      }
    });
  }

  /**
   * Patch the resource at the given URI with an updated representation.
   * @returns {Promise<Resource|Object, ResourceError>}
   */
  patch(uri, representation, config) {
    if (config === undefined) {
      config = {};
    }
    uri = normalizeURI(this.base_uri, uri);

    const headers = {
      ...this.makeHeaders(),
      'Accept': config.accept || 'application/json',
      'X-HTTP-Method-Override': 'PATCH',
      'Content-Type': 'application/json',
      'X-Content-Type-Override': 'application/json'
    };

    return fetch(uri, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(representation)
    }).then(response => {
      if (Math.floor(response.status / 100) == 2) {
        return wrapResourceOnSuccess(response, this, uri, 'PATCH');
      } else {
        throw new ResourceError(response, this, uri, 'PATCH');
      }
    });
  }

  /** Given a representation, turn it into a subclass of Resource. */
  wrap_resource(uri, representation) {
    if (representation === null || representation === undefined) {
      return representation;
    }
    if (representation.resource_type_link === undefined) {
      // This is a non-entry object returned by a named operation.  It's
      // either a list or a random JSON object.
      if (representation.total_size !== undefined
        || representation.total_size_link !== undefined) {
        // It's a list.  Treat it as a collection; it should be sliceable.
        return new Collection(this, representation, uri);
      } else if (typeof representation === 'object') {
        // It's an Array or mapping.  Recurse into it.
        let new_representation;
        if (Array.isArray(representation)) {
          new_representation = [];
        } else {
          new_representation = {};
        }
        for (const key of Object.keys(representation)) {
          let value = representation[key];
          if (value !== null && value !== undefined) {
            value = this.wrap_resource(value.self_link, value);
          }
          new_representation[key] = value;
        }
        return new_representation;
      } else {
        // It's a random JSON object. Leave it alone.
        return representation;
      }
    } else if (representation.resource_type_link.search(
        /\/#service-root$/) !== -1) {
      return new Root(this, representation, uri);
    } else if (representation.total_size === undefined) {
      return new Entry(this, representation, uri);
    } else {
      return new Collection(this, representation, uri);
    }
  }
}
