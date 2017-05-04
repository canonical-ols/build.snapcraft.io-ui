// Ensure that GitHubUser model is registered; we do not need to import any
// bindings.
import './github-user';

export default function register(db) {
  /* Schema:
   *   id: automatic serial number
   *   owner: repository owner name
   *   name: repository name
   *   snapcraft_name: name in snapcraft.yaml
   *   store_name: registered store name corresponding to this repository
   *   registrant: GitHub user who registered this repository in BSI
   *   created_at: creation date
   *   updated_at: update date
   */
  db.model('Repository', {
    tableName: 'repository',
    registrant: function() {
      return this.belongsTo('GitHubUser', 'registrant_id');
    },
    hasTimestamps: true
  });
}
