import _ from 'lodash';
import { SavedWorkspaceProvider } from './saved_workspace';
import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';

// bring in the factory
import { SavedObjectRegistryProvider } from 'ui/saved_objects/saved_object_registry';
import { SavedObjectsClientProvider } from 'ui/saved_objects';


export function SavedWorkspacesProvider(kbnUrl, Private, Promise) {
  const savedObjectsClient = Private(SavedObjectsClientProvider);
  const SavedWorkspace = Private(SavedWorkspaceProvider);

  this.type = SavedWorkspace.type;
  this.Class = SavedWorkspace;

  this.loaderProperties = {
    name: 'Graph workspace',
    noun: 'Graph workspace',
    nouns: 'Graph workspaces'
  };

  // Returns a single dashboard by ID, should be the name of the workspace
  this.get = function (id) {
    // Returns a promise that contains a workspace which is a subclass of docSource
    return (new SavedWorkspace(id)).init();
  };

  this.urlFor = function (id) {
    return chrome.addBasePath(kbnUrl.eval('/app/graph#/workspace/{{id}}', { id }));
  };

  this.delete = function (ids) {
    ids = !_.isArray(ids) ? [ids] : ids;
    return Promise.map(ids, function (id) {
      return (new SavedWorkspace(id)).delete();
    });
  };

  this.mapHits = function (hit) {
    const source = hit.attributes;
    source.id = hit.id;
    source.url = this.urlFor(hit.id);
    source.icon = 'fa-share-alt';// looks like a graph
    return source;
  };

  this.find = function (searchString, size = 100) {
    let body;
    if (searchString) {
      body = {
        query: {
          simple_query_string: {
            query: searchString + '*',
            fields: ['title^3', 'description'],
            default_operator: 'AND'
          }
        }
      };
    } else {
      body = { query: { match_all: {} } };
    }

    return savedObjectsClient.find({
      type: SavedWorkspace.type,
      search: searchString ? `${searchString}*` : undefined,
      perPage: size,
      searchFields: ['title^3', 'description']
    })
      .then(resp => {
        return {
          total: resp.total,
          hits: resp.savedObjects.map((hit) => this.mapHits(hit))
        };
      });
  };
}
// This is the only thing that gets injected into controllers
uiModules.get('app/graph').service('savedGraphWorkspaces',  function (Private) {
  return Private(SavedWorkspacesProvider);
});

SavedObjectRegistryProvider.register(SavedWorkspacesProvider);
