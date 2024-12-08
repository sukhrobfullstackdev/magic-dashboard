const fiveSeconds = 5;
const oneMinute = 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 60;

/**
 *  converting given timestamp (in seconds) to text representation
 */
export function getDisplayTime(timestamp: number) {
  const now = Math.floor(Date.now() / 1000);
  const elapsedTime = now - timestamp;

  if (elapsedTime < fiveSeconds) {
    return 'Just now';
  }

  if (elapsedTime < oneMinute) {
    return 'A few seconds ago';
  }

  if (elapsedTime < oneHour) {
    const numMinutes = Math.floor(elapsedTime / oneMinute);
    return `${numMinutes} minute${numMinutes > 1 ? 's' : ''} ago`;
  }

  if (elapsedTime < oneDay) {
    const numHours = Math.floor(elapsedTime / oneHour);
    return `${numHours} hour${numHours > 1 ? 's' : ''} ago`;
  }

  const signedupDate = new Date(0);
  signedupDate.setUTCSeconds(timestamp);
  return signedupDate.toString().substring(4, 24);
}
