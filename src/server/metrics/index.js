import updateGitHubUsersTotal from './github-users';

let existingInterval = null;

export default async function startAllMetrics() {
  if (existingInterval !== null) {
    clearInterval(existingInterval);
  }

  async function updateAllMetrics() {
    await updateGitHubUsersTotal();
  }

  await updateAllMetrics();
  existingInterval = setInterval(updateAllMetrics, 10000);
  return existingInterval;
}
