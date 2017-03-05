import db from '../index';

export const GitHubUser = db.Model.extend({
  tableName: 'github_user',
  hasTimestamps: true
});
