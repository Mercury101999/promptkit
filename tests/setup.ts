import '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(async () => true),
}));

jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };
  return {
    router,
    useRouter: () => router,
    usePathname: () => (globalThis as { __promptkitPath?: string }).__promptkitPath ?? '/',
  };
});

jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => false),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-file-system', () => ({
  File: class File {
    create() {
      return undefined;
    }
    write() {
      return Promise.resolve();
    }
    text() {
      return Promise.resolve('');
    }
  },
  Paths: { cache: 'cache' },
}));
