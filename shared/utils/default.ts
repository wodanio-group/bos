
export const stringToAlias = (str: string): string => {
  return str.trim().toLowerCase()
    .replaceAll(/\s/g, '-')
    .replaceAll('_', '-')
    .replaceAll('ä', 'ae')
    .replaceAll('ü', 'ue')
    .replaceAll('ö', 'oe')
    .split('')
    .filter(l => l.charCodeAt(0) === 45 || (l.charCodeAt(0) >= 48 && l.charCodeAt(0) <= 57) || (l.charCodeAt(0) >= 97 && l.charCodeAt(0) <= 122))
    .join('')
    .replaceAll(/-{2,}/g, '-');
}
