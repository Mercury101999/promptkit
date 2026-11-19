import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export async function readPickedJson(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', 'text/plain'],
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  if (asset.file) return asset.file.text();
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    return response.text();
  }
  return new File(asset.uri).text();
}

export async function exportJsonFile(filename: string, contents: string): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  await file.write(contents);
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device. Copy the JSON instead.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export PromptKit templates',
    UTI: 'public.json',
  });
}
