export function hasRepository(arr, repository) {
  return arr.some((item) => item.fullName === repository.fullName);
}

// TODO bartaz refactor
// not needed when we can get snap by id from entities?
export function hasSnapForRepository(snaps, repository) {
  return snaps.some((snap) => snap.git_repository_url === repository.url);
}
