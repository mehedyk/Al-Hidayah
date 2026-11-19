import { formatReference } from '../data';
import type { Item } from '../types';

export function reminderText(item: Item, includeEnglish: boolean, includeBangla: boolean): string {
  return [
    item.ar,
    includeEnglish ? item.en : null,
    includeBangla ? item.bn : null,
    formatReference(item),
    item.contextUrl,
  ]
    .filter((part): part is string => part !== null)
    .join('\n\n');
}
