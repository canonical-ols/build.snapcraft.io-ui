export const OYEZ = 'OYEZ';

export function oyez(text, status='error') {
  return {
    type: OYEZ,
    text,
    status
  };
}
