export interface AuthUser {
  _id: string;
  email: string;
  role: string;
}

export const getAuthToken = (): string => localStorage.getItem('token') ?? '';

export const getAuthRole = (): string => localStorage.getItem('role') ?? '';

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};

export const saveAuth = (token: string, role: string, user?: AuthUser): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getStoredUser = (): AuthUser | null => {
  const rawUser = localStorage.getItem('user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};
