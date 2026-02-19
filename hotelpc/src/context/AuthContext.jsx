import { createContext, useContext, useCallback, useMemo, useState } from 'react';

const STORAGE_USERS = 'eshotel_users';
const STORAGE_CURRENT = 'eshotel_current_user';

const DEFAULT_USERS = [
  { username: '1234', password: '1234', role: 'merchant' },
  { username: 'admin', password: '1234', role: 'admin' },
];

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {}
  localStorage.setItem(STORAGE_USERS, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [currentUser, setCurrentUserState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const setCurrentUser = useCallback((user) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_CURRENT, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT);
    }
  }, []);

  const login = useCallback(
    (username, password) => {
      const list = typeof users === 'function' ? loadUsers() : users;
      const u = list.find(
        (x) => String(x.username).toLowerCase() === String(username).toLowerCase() && x.password === password
      );
      if (!u) return { ok: false, message: '账号或密码错误' };
      const { password: _, ...rest } = u;
      setCurrentUser(rest);
      return { ok: true, role: u.role, user: rest };
    },
    [users, setCurrentUser]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const register = useCallback((username, password, role) => {
    const list = loadUsers();
    if (list.some((x) => String(x.username).toLowerCase() === String(username).toLowerCase())) {
      return { ok: false, message: '该账号已存在' };
    }
    const newList = [...list, { username, password, role: role === 'admin' ? 'admin' : 'merchant' }];
    setUsers(newList);
    localStorage.setItem(STORAGE_USERS, JSON.stringify(newList));
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      register,
      isAdmin: currentUser?.role === 'admin',
      isMerchant: currentUser?.role === 'merchant',
    }),
    [currentUser, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
