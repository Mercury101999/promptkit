export function formatWhen(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const delta = Math.max(0, now - then);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 hr ago' : `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}
