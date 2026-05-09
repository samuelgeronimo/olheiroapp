/**
 * Utilities for date and time formatting.
 */

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '--:--';

  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }

  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) return 'há 1 minuto';
    return `há ${diffInMinutes} minutos`;
  }

  if (diffInHours < 24) {
    if (diffInHours === 1) return 'há 1 hora';
    return `há ${diffInHours} horas`;
  }

  if (diffInDays < 7) {
    if (diffInDays === 1) return 'há 1 dia';
    return `há ${diffInDays} dias`;
  }

  // Fallback to localized date+time for older updates
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Always formats as "dd/MM/yyyy, HH:mm" regardless of how old.
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '--:--';

  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
