export type NotificationType = 'success' | 'error' | 'info';

export function showNotification(message: string, type: NotificationType = 'info') {
  const colors = {
    success: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    error:   { bg: 'bg-red-100',   border: 'border-red-400',   text: 'text-red-700',   icon: 'M6 18L18 6M6 6l12 12' },
    info:    { bg: 'bg-blue-100',  border: 'border-blue-400',  text: 'text-blue-700',  icon: 'M13 16h-1v-4h-1m1-4h.01' }
  };
  const color = colors[type];

  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 ${color.bg} ${color.border} ${color.text} px-4 py-3 rounded shadow-lg max-w-sm flex items-center`;
  notification.innerHTML = `
    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${color.icon}" />
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) notification.parentNode.removeChild(notification);
  }, 4000);
}

let bulkNotificationDiv: HTMLDivElement | null = null;

export function showBulkProgressNotification(message: string, progress: number, total: number) {
  if (!bulkNotificationDiv) {
    bulkNotificationDiv = document.createElement('div');
    bulkNotificationDiv.className = `fixed top-4 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg max-w-sm flex flex-col items-center`;
    document.body.appendChild(bulkNotificationDiv);
  }
  bulkNotificationDiv.innerHTML = `
    <span>${message}</span>
    <div class="w-full bg-blue-200 rounded-full h-2 mt-2 mb-1">
      <div class="bg-blue-600 h-2 rounded-full transition-all" style="width:${(progress / total) * 100}%"></div>
    </div>
    <span class="text-xs text-blue-700">${progress} / ${total} reports</span>
  `;
  if (progress >= total) {
    setTimeout(() => {
      if (bulkNotificationDiv && bulkNotificationDiv.parentNode) {
        bulkNotificationDiv.parentNode.removeChild(bulkNotificationDiv);
        bulkNotificationDiv = null;
      }
    }, 2000);
  }
}