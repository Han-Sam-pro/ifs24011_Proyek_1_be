import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => children,
  Map: ({ children, onClick }: any) => React.createElement('div', { 'data-testid': 'google-map', onClick: (e: any) => onClick && onClick({ detail: { latLng: { lat: () => -7.795, lng: () => 110.369 } } }) }, children),
  AdvancedMarker: ({ children, onClick }: any) => React.createElement('div', { 'data-testid': 'advanced-marker', onClick }, children),
  InfoWindow: ({ children, onCloseClick }: any) => React.createElement('div', { 'data-testid': 'info-window' }, [
    children,
    React.createElement('button', { key: 'close', 'aria-label': 'Close InfoWindow', onClick: onCloseClick }, 'x')
  ]),
  useMap: () => ({
    panTo: vi.fn(),
    fitBounds: vi.fn(),
  }),
  useMapsLibrary: () => null,
}));


if (typeof window !== 'undefined') {
  window.google = {
    maps: {
      Polyline: class {
        setMap() {}
      },
      LatLngBounds: class {
        extend() {}
      },
    },
  } as any;

  window.scrollTo = vi.fn() as any;
  window.print = vi.fn() as any;
  document.execCommand = vi.fn() as any;

  if (!navigator.clipboard) {
    (navigator as any).clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
  } else {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  }
}



