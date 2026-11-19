import * as Clipboard from 'expo-clipboard';
import { Platform, Share } from 'react-native';

function isIosWeb(): boolean {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPadOs;
}

/**
 * iOS Safari only allows a clipboard write that starts inside the tap.
 * execCommand is synchronous, so it still works when the async API does not.
 */
function copyWithExecCommand(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '0';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, area.value.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export async function copyText(text: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (isIosWeb() && copyWithExecCommand(text)) return true;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Try the synchronous fallback below.
    }
    return copyWithExecCommand(text);
  }

  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch {
    return false;
  }
}

export function shareIsAvailable(): boolean {
  if (Platform.OS !== 'web') return true;
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export async function shareText(text: string): Promise<'shared' | 'dismissed' | 'unavailable'> {
  if (Platform.OS === 'web') {
    if (!shareIsAvailable()) return 'unavailable';
    try {
      await navigator.share({ title: 'PromptKit prompt', text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'dismissed';
      return 'unavailable';
    }
  }

  try {
    const result = await Share.share({ message: text });
    if (result.action === Share.dismissedAction) return 'dismissed';
    return 'shared';
  } catch {
    return 'unavailable';
  }
}
