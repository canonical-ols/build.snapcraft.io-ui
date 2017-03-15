import promClient from 'prom-client';

import db from '../db';

const gitHubUsersTotal = new promClient.Gauge(
  'bsi_github_users_total',
  'Total number of GitHub users who have ever logged in.',
  ['metric_type']
);

export default async function updateGitHubUsersTotal() {
  const gitHubUser = db.model('GitHubUser');
  gitHubUsersTotal.set({ metric_type: 'kpi' }, await gitHubUser.count());
}
