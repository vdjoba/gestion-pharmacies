export type AppSection = 'public' | 'admin';
export type AuthRole = 'admin' | 'pharmacien' | 'client' | '';

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      checkForUpdates?: () => Promise<{ skipped?: boolean; version?: string | null }>;
      installDownloadedUpdate?: () => Promise<void>;
      onUpdateStatus?: (callback: (message: string) => void) => () => void;
    };
  }
}

export const isDesktopShell = (): boolean =>
  Boolean(window.electronAPI) || import.meta.env.VITE_APP_MODE === 'desktop';

export const getDefaultRouteForRole = (role: string): string => {
  if (role === 'admin') {
    return '/admin';
  }

  if (role === 'pharmacien') {
    return '/admin';
  }

  if (role === 'client') {
    return '/client/dashboard';
  }

  return isDesktopShell() ? '/admin/login' : '/login';
};
