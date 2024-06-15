export function formatCurrency(value) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function calcMinutesLeft(dateStr) {
  const d1 = new Date().getTime();
  const d2 = new Date(dateStr).getTime();
  return Math.round((d2 - d1) / 60000);
}

export function calcTimeSent(dateStr) {
  const d1 = new Date().getTime();
  const d2 = new Date(dateStr).getTime();
  const minute = Math.round((d1 - d2) / 60000);
  const hour = Math.round(minute / 60);
  const day = Math.round(hour / 24);
  const week = Math.round(day / 7);
  const month = Math.round(day / 30);
  const year = Math.round(day / 365);

  if (year >= 1) {
    return year + ` year${year > 1 ? 's' : ''} ago`;
  }

  if (month >= 1) {
    return month + ` month${month > 1 ? 's' : ''} ago`;
  }

  if (week >= 1) {
    return week + ` week${week > 1 ? 's' : ''} ago`;
  }

  if (day >= 1) {
    return day + ` day${day > 1 ? 's' : ''} ago`;
  }

  if (hour >= 1) {
    return hour + ` hour${hour > 1 ? 's' : ''} ago`;
  }
  if (minute >= 1) {
    return minute + ` minute${minute > 1 ? 's' : ''} ago`;
  }
  return 'now';
}
