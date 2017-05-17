import qs from 'qs';

import { conf } from '../../../helpers/config';
import { parseGitHubRepoUrl } from '../../../helpers/github-url';

const BASE_URL = conf.get('BASE_URL');

export default function getTemplateUrl(repositoryUrl, configFilePath) {
  const { owner, name } = parseGitHubRepoUrl(repositoryUrl);
  return `${BASE_URL}/api/github/repos/${owner}/${name}/edit?` + qs.stringify({
    filename: configFilePath
  });
}
