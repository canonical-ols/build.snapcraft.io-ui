const STRINGS = {
  'Successfully built': 'Built and published',
  'Needs building': 'Building soon'
};

export default function mapApiString(lpString) {
  return STRINGS.hasOwnProperty(lpString) ? STRINGS[lpString] : lpString;
}
