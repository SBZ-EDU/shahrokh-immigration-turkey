import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sendTelegramMessage } from '../services/telegramService';

export type UserRole = 'admin' | 'user' | 'guest';

export interface ShahrokhUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: number;
}

interface AuthContextType {
  user: ShahrokhUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users — in production replaced by D1 + Cloudflare Access
const MOCK_ADMIN: ShahrokhUser & { password: string } = {
  id: 'admin-001',
  email: 'admin@shahrokh.ir',
  password: 'admin123',
  name: 'مدیر شاهرخ',
  role: 'admin',
  createdAt: Date.now(),
};

const SUPER_ADMIN: ShahrokhUser & { password: string } = {
  id: 'super-001',
  email: 'super@shahrokh.ir',
  password: 'Super123!',
  name: 'سوپر ادمین شاهرخ',
  role: 'admin',
  createdAt: Date.now(),
};

const STORAGE_KEY = 'shahrokh_auth_user';
const TELEGRAM_MANAGER_ID = '@immig_1'; // مدیریت شاهرخ — همه تاریخچه کاربران جدید اینجا می‌رود
const TELEGRAM_MANAGER_CHAT_FALLBACK = 'immig_1'; // بدون @ برای try

const notifyManagerNewUser = async (u: ShahrokhUser, action: 'login' | 'register') => {
  const text = `
🆕 <b>کاربر جدید — گروه شاهرخ</b>

👤 <b>نام:</b> ${u.name}
📧 <b>ایمیل:</b> ${u.email}
🆔 <b>ID:</b> ${u.id}
🔑 <b>نقش:</b> ${u.role}
📅 <b>تاریخ:</b> ${new Date(u.createdAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}
⚡ <b>عمل:</b> ${action === 'register' ? 'ثبت‌نام' : 'ورود'}
🌐 <b>دامنه:</b> immigration.exhibition2wotld.ir
🏘️ <b>رقابت املاک:</b> یورو فعال — ۱۸۴K€ / ۲۰۰K$
`.trim();
  // Try @immig_1, fallback to admin chat ID
  const targets = [TELEGRAM_MANAGER_ID, '@immig_1', 'immig_1'];
  for (const chatId of targets) {
    try {
      await sendTelegramMessage(chatId, text, { parseMode: 'HTML' });
      console.log('Sent new user to', chatId);
      return;
    } catch (e) {
      console.warn('Failed to send to', chatId, e);
    }
  }
  // Also try via general lead function (uses VITE_TELEGRAM_ADMIN_CHAT_ID)
  try {
    const { sendLeadToTelegram } = await import('../services/telegramService');
    await sendLeadToTelegram({ name: u.name, email: u.email, message: `کاربر جدید ${action}: ${u.name} (${u.email})`, pathway: 'ثبت‌نام', source: 'immigration.exhibition2wotld.ir' });
  } catch {}
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ShahrokhUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock check — super admin
    if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
      const { password: _, ...superUser } = SUPER_ADMIN;
      setUser(superUser);
      setTimeout(() => notifyManagerNewUser(superUser, 'login'), 500);
      return true;
    }
    // Mock check — admin
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      const { password: _, ...adminUser } = MOCK_ADMIN;
      setUser(adminUser);
      // Notify manager even for admin login (for history)
      setTimeout(() => notifyManagerNewUser(adminUser, 'login'), 500);
      return true;
    }
    // Any other email → regular user (demo)
    if (email.includes('@') && password.length >= 4) {
      const newUser: ShahrokhUser = {
        id: 'user-' + btoa(email).slice(0, 8),
        email,
        name: email.split('@')[0],
        role: 'user',
        createdAt: Date.now(),
      };
      // Fire-and-forget to Telegram @immig_1
      setTimeout(() => notifyManagerNewUser(newUser, 'login'), 500);
      setUser(newUser);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    if (!email.includes('@') || password.length < 4) return false;
    const newUser: ShahrokhUser = {
      id: 'user-' + Date.now(),
      email,
      name: name || email.split('@')[0],
      role: 'user',
      createdAt: Date.now(),
    };
    setUser(newUser);
    // Notify manager @immig_1 with history
    setTimeout(() => notifyManagerNewUser(newUser, 'register'), 500);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'admin', isUser: user?.role === 'user' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
};
