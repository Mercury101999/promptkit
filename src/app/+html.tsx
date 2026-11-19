import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { BASE_PATH } from '@/lib/basePath';

const description = 'Build a clear AI prompt from a short form, then copy it. Works offline on your phone.';

const serviceWorker = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('${BASE_PATH}/sw.js', { scope: '${BASE_PATH}/' }).catch(function (error) {
      console.warn('PromptKit service worker registration failed', error);
    });
  });
}
`;

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>PromptKit</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#F3EFE6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PromptKit" />
        <link rel="manifest" href={`${BASE_PATH}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${BASE_PATH}/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" href={`${BASE_PATH}/favicon.png`} />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; }
              body { margin: 0; background: #F3EFE6; }
              @media (prefers-color-scheme: dark) {
                body { background: #121410; }
              }
              :root { --focus: #0E5C59; }
              :focus-visible {
                outline: 3px solid var(--focus);
                outline-offset: 2px;
              }
              @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                  animation-duration: 0.01ms !important;
                  animation-iteration-count: 1 !important;
                  transition-duration: 0.01ms !important;
                  scroll-behavior: auto !important;
                }
              }
            `,
          }}
        />
        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: serviceWorker }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
