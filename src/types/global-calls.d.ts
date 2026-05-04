import type { GlobalCallFunctions } from '@/utils/globalCalls';

declare global {
  interface Window extends GlobalCallFunctions {}
}

declare module 'vue' {
  interface ComponentCustomProperties extends GlobalCallFunctions {}
}

export {};
