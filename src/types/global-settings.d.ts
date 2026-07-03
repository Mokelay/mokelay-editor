import type { MokelaySettings } from '@/utils/globalSettings';

declare global {
  interface Window {
    $mokelaySettings: MokelaySettings;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $mokelaySettings: MokelaySettings;
  }
}

export {};
