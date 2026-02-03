// lib/cookieUtils.ts - Enhanced with iOS session persistence fix
const DEFAULT_PATH = '/';
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60;
const DEFAULT_SAME_SITE = 'lax';

interface CookieOptions {
  path?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
}

interface StorageItem<T> {
  value: T;
  expiry: number | null;
  timestamp: number;
  userId?: string;
  version?: string;
}

// 🍎 iOS DETECTION AND COOKIE ENHANCEMENT
const isIOSDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// 🔧 iOS-OPTIMIZED COOKIE FUNCTIONS
export const setCookie = (name: string, value: string, options?: CookieOptions): void => {
  try {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookieString += `; path=${options?.path || DEFAULT_PATH}`;
    
    // 🍎 iOS-specific optimizations
    const isIOS = isIOSDevice();
    const isAuthCookie = name.includes('auth') || name.includes('session') || name.includes('userRole') || name.includes('supabase');
    
    if (options?.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    } else if (options?.maxAge !== undefined) {
      cookieString += `; max-age=${options.maxAge}`;
    } else {
      // 🍎 For auth cookies on iOS, use longer expiry to combat Safari's aggressive clearing
      const maxAge = isIOS && isAuthCookie ? 30 * 24 * 60 * 60 : DEFAULT_MAX_AGE; // 30 days for iOS auth
      cookieString += `; max-age=${maxAge}`;
    }
    
    // 🍎 iOS requires these specific settings for session persistence
    if (isAuthCookie) {
      cookieString += '; secure'; // Always secure for auth cookies
      cookieString += `; samesite=lax`; // iOS Safari compatible
      // Don't set domain for iOS auth cookies - let browser handle it
    } else {
      if (options?.domain) cookieString += `; domain=${options.domain}`;
      if (options?.secure || (typeof window !== 'undefined' && window.location.protocol === 'https:')) {
        cookieString += '; secure';
      }
      if (options?.httpOnly) cookieString += '; httponly';
      cookieString += `; samesite=${options?.sameSite || DEFAULT_SAME_SITE}`;
    }
    
    if (typeof document !== 'undefined') {
      document.cookie = cookieString;
      console.log(`[Cookie] Set: ${name} (${value.length} chars)${isIOS && isAuthCookie ? ' [iOS-optimized]' : ''}`);
      
      // 🍎 iOS BACKUP: Also store auth data in localStorage as fallback
      if (isIOS && isAuthCookie) {
        try {
          localStorage.setItem(`backup_${name}`, JSON.stringify({
            value,
            timestamp: Date.now(),
            maxAge: options?.maxAge || (30 * 24 * 60 * 60)
          }));
          console.log(`[Cookie] 🍎 iOS backup stored for ${name}`);
        } catch (e) {
          console.warn(`[Cookie] iOS backup failed for ${name}:`, e);
        }
      }
    }
  } catch (e) {
    console.error(`[Cookie] Error setting ${name}:`, e);
  }
};

export const getCookie = (name: string): string | null => {
  try {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';').map(c => c.trim());
    const encodedName = encodeURIComponent(name);
    const cookie = cookies.find(c => c.startsWith(`${encodedName}=`));
    
    if (cookie) {
      const value = cookie.split('=')[1];
      try {
        return decodeURIComponent(value);
      } catch (e) {
        console.error(`[Cookie] Error decoding cookie value for ${name}:`, e);
        return value;
      }
    }
    
    // 🍎 iOS FALLBACK: Check localStorage backup for auth cookies
    const isIOS = isIOSDevice();
    const isAuthCookie = name.includes('auth') || name.includes('session') || name.includes('userRole') || name.includes('supabase');
    
    if (isIOS && isAuthCookie && typeof localStorage !== 'undefined') {
      try {
        const backupData = localStorage.getItem(`backup_${name}`);
        if (backupData) {
          const parsed = JSON.parse(backupData);
          const age = (Date.now() - parsed.timestamp) / 1000; // age in seconds
          
          if (age < parsed.maxAge) {
            console.log(`[Cookie] 🍎 Using iOS backup for ${name}`);
            return parsed.value;
          } else {
            // Expired backup
            localStorage.removeItem(`backup_${name}`);
            console.log(`[Cookie] 🍎 Expired iOS backup removed for ${name}`);
          }
        }
      } catch (e) {
        console.warn(`[Cookie] iOS backup retrieval failed for ${name}:`, e);
      }
    }
    
    return null;
  } catch (e) {
    console.error(`[Cookie] Error getting ${name}:`, e);
    return null;
  }
};

export const removeCookie = (name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void => {
  setCookie(name, '', { ...options, expires: new Date(0), maxAge: 0 });
  
  // 🍎 iOS: Also remove backup
  if (isIOSDevice()) {
    try {
      localStorage.removeItem(`backup_${name}`);
      console.log(`[Cookie] 🍎 iOS backup removed for ${name}`);
    } catch (e) {
      console.warn(`[Cookie] iOS backup removal failed for ${name}:`, e);
    }
  }
  
  console.log(`[Cookie] Removed: ${name}`);
};

export const setJSONCookie = <T>(name: string, value: T, options?: CookieOptions): void => {
  try {
    const stringValue = JSON.stringify(value);
    setCookie(name, stringValue, options);
  } catch (e) {
    console.error(`[Cookie] Error stringifying JSON for cookie ${name}:`, e);
  }
};

export const getJSONCookie = <T>(name: string, defaultValue?: T): T | null => {
  const cookie = getCookie(name);
  if (!cookie) return defaultValue || null;
  try {
    return JSON.parse(cookie) as T;
  } catch (e) {
    console.error(`[Cookie] Error parsing JSON from cookie ${name}:`, e);
    removeCookie(name);
    return defaultValue || null;
  }
};

const CACHE_VERSION = '1.2.0';

export const storage = {
  set: <T>(key: string, value: T, expiryInSeconds?: number, userId?: string): void => {
    const item: StorageItem<T> = {
      value,
      expiry: expiryInSeconds ? Date.now() + expiryInSeconds * 1000 : null,
      timestamp: Date.now(),
      userId,
      version: CACHE_VERSION
    };
    const serializedItem = JSON.stringify(item);
    
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serializedItem);
        console.log(`[Storage] ✅ Set in localStorage: ${key} (${serializedItem.length} chars) ${userId ? `for user ${userId.slice(-4)}` : ''}`);
        return;
      }
    } catch (e) { 
      console.warn(`[Storage] localStorage failed for ${key}:`, e); 
    }
    
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, serializedItem);
        console.log(`[Storage] ⚠️ Set in sessionStorage: ${key} (fallback)`);
        return;
      }
    } catch (e) { 
      console.warn(`[Storage] sessionStorage failed for ${key}:`, e); 
    }
    
    try {
      if (serializedItem.length < 3000) {
        setJSONCookie(key, item, { maxAge: expiryInSeconds || DEFAULT_MAX_AGE });
        console.log(`[Storage] ⚠️ Set in cookie: ${key} (fallback)`);
        return;
      }
    } catch (e) { 
      console.warn(`[Storage] Cookie fallback failed for ${key}:`, e); 
    }
    
    console.error(`[Storage] ❌ All storage methods failed for ${key}`);
  },
  
  get: <T>(key: string, defaultValue?: T, expectedUserId?: string): T | null => {
    const sources = [
      { name: 'localStorage', storage: typeof localStorage !== 'undefined' ? localStorage : null },
      { name: 'sessionStorage', storage: typeof sessionStorage !== 'undefined' ? sessionStorage : null },
      { name: 'cookie', storage: { getItem: (k: string) => getJSONCookie(k) } }
    ];
    
    for (const { name, storage: source } of sources) {
      if (!source) continue;
      
      try {
        const rawItem = source.getItem(key);
        if (!rawItem) continue;
        
        const item: StorageItem<T> = typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
        
        if (item.version !== CACHE_VERSION) {
          console.log(`[Storage] 🔄 Version mismatch for ${key} in ${name}, removing`);
          this.remove(key);
          continue;
        }
        
        if (item.expiry && Date.now() > item.expiry) {
          console.log(`[Storage] ⏰ Expired item in ${name}: ${key}`);
          this.remove(key);
          continue;
        }
        
        if (expectedUserId && item.userId && item.userId !== expectedUserId) {
          console.log(`[Storage] 👤 User mismatch for ${key} in ${name}. Expected: ${expectedUserId.slice(-4)}, Found: ${item.userId.slice(-4)}`);
          continue;
        }
        
        console.log(`[Storage] ✅ Found in ${name}: ${key} ${item.userId ? `(user ${item.userId.slice(-4)})` : ''}`);
        return item.value;
      } catch (e) {
        console.warn(`[Storage] Error reading from ${name} for ${key}:`, e);
        continue;
      }
    }
    
    console.log(`[Storage] 🔍 Not found in any storage: ${key}`);
    return defaultValue || null;
  },
  
  remove: (key: string): void => {
    let removedFrom: string[] = [];
    try { 
      if (typeof localStorage !== 'undefined') { 
        localStorage.removeItem(key); 
        removedFrom.push('localStorage'); 
      } 
    } catch (e) { 
      console.warn(`[Storage] Error removing from localStorage: ${key}`, e); 
    }
    
    try { 
      if (typeof sessionStorage !== 'undefined') { 
        sessionStorage.removeItem(key); 
        removedFrom.push('sessionStorage'); 
      } 
    } catch (e) { 
      console.warn(`[Storage] Error removing from sessionStorage: ${key}`, e); 
    }
    
    try { 
      removeCookie(key); 
      removedFrom.push('cookie'); 
    } catch (e) { 
      console.warn(`[Storage] Error removing cookie: ${key}`, e); 
    }
    
    console.log(`[Storage] 🗑️ Removed from [${removedFrom.join(', ')}]: ${key}`);
  },
  
  has: (key: string, expectedUserId?: string): boolean => {
    const value = storage.get(key, undefined, expectedUserId);
    return value !== null;
  },
  
  debug: (key: string): { [source: string]: any } => {
    const result: { [source: string]: any } = {};
    try { 
      if (typeof localStorage !== 'undefined') { 
        const item = localStorage.getItem(key); 
        result.localStorage = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false }; 
      } 
    } catch (e) { 
      result.localStorage = { error: e.message }; 
    }
    
    try { 
      if (typeof sessionStorage !== 'undefined') { 
        const item = sessionStorage.getItem(key); 
        result.sessionStorage = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false }; 
      } 
    } catch (e) { 
      result.sessionStorage = { error: e.message }; 
    }
    
    try { 
      const item = getCookie(key); 
      result.cookie = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false }; 
    } catch (e) { 
      result.cookie = { error: e.message }; 
    }
    
    return result;
  },
  
  cleanup: (): void => {
    const storages = [
      { name: 'localStorage', storage: typeof localStorage !== 'undefined' ? localStorage : null },
      { name: 'sessionStorage', storage: typeof sessionStorage !== 'undefined' ? sessionStorage : null }
    ];
    
    storages.forEach(({ name, storage: store }) => {
      if (!store) return;
      
      const keysToRemove: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (!key) continue;
        
        try {
          const item = store.getItem(key);
          if (!item) continue;
          
          const parsed: StorageItem<any> = JSON.parse(item);
          if (parsed.expiry && Date.now() > parsed.expiry) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // Invalid JSON, remove it
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => store.removeItem(key));
      if (keysToRemove.length > 0) {
        console.log(`[Storage] 🧹 Cleaned ${keysToRemove.length} expired items from ${name}`);
      }
    });
  }
};

// Initialize cleanup interval
if (typeof window !== 'undefined') {
  storage.cleanup();
  setInterval(() => { storage.cleanup(); }, 10 * 60 * 1000);
}

export const getLastPageForRedirect = (): string => {
  const lastPage = getCookie('lastPage');
  if (!lastPage) {
    console.log('[LastPage] No cookie found, redirecting to /');
    return '/';
  }
  const excludedPages = ['/sign-in', '/sign-up', '/forgot-password'];
  if (excludedPages.includes(lastPage)) {
    console.log(`[LastPage] Stored page is auth page (${lastPage}), redirecting to /`);
    return '/';
  }
  if (lastPage.startsWith('/#')) {
    console.log(`[LastPage] Hash route detected (${lastPage}), redirecting to / and preserving hash`);
    return '/';
  }
  console.log(`[LastPage] Using stored page: ${lastPage}`);
  return lastPage;
};

// 🔥 USER ROLE UTILITIES - ENHANCED FOR iOS
const VALID_USER_ROLES = ['admin1', 'coachx7', 'client7x', 'user0x'] as const;
type ValidUserRole = typeof VALID_USER_ROLES[number];

export const userRoleCookies = {
  setUserRole: (role: string, userId?: string): boolean => {
    try {
      if (!VALID_USER_ROLES.includes(role as ValidUserRole)) {
        console.warn(`[UserRole] Invalid role attempted: ${role}. Valid roles:`, VALID_USER_ROLES);
        return false;
      }
      
      // 🍎 iOS-optimized settings for user role cookies
      const cookieOptions: CookieOptions = {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
        sameSite: 'lax'
      };
      
      setCookie('userRole', role, cookieOptions);
      if (userId) setCookie('userRoleUserId', userId, cookieOptions);
      
      console.log(`[UserRole] ✅ Stored role: ${role} ${userId ? `for user ${userId.slice(-4)}` : ''}${isIOSDevice() ? ' [iOS-optimized]' : ''}`);
      return true;
    } catch (error) {
      console.error('[UserRole] Error storing role:', error);
      return false;
    }
  },

  getUserRole: (expectedUserId?: string): ValidUserRole | null => {
    try {
      const role = getCookie('userRole');
      const storedUserId = getCookie('userRoleUserId');
      
      if (!role || !VALID_USER_ROLES.includes(role as ValidUserRole)) {
        if (role) {
          console.warn(`[UserRole] Invalid stored role: ${role}`);
          userRoleCookies.clearUserRole();
        }
        return null;
      }
      
      if (expectedUserId && storedUserId && storedUserId !== expectedUserId) {
        console.warn(`[UserRole] User ID mismatch. Expected: ${expectedUserId.slice(-4)}, Stored: ${storedUserId.slice(-4)}`);
        userRoleCookies.clearUserRole();
        return null;
      }
      
      console.log(`[UserRole] ✅ Retrieved role: ${role} ${storedUserId ? `for user ${storedUserId.slice(-4)}` : ''}`);
      return role as ValidUserRole;
    } catch (error) {
      console.error('[UserRole] Error retrieving role:', error);
      return null;
    }
  },

  isRoleValidForUser: (userId: string): boolean => {
    const storedUserId = getCookie('userRoleUserId');
    return storedUserId === userId;
  },

  clearUserRole: (): void => {
    try {
      removeCookie('userRole');
      removeCookie('userRoleUserId');
      console.log('[UserRole] 🗑️ Cleared user role cookies');
    } catch (error) {
      console.error('[UserRole] Error clearing role:', error);
    }
  },

  updateRoleIfChanged: (newRole: string, userId?: string): boolean => {
    const currentRole = userRoleCookies.getUserRole(userId);
    if (currentRole !== newRole) {
      console.log(`[UserRole] 🔄 Role changed from ${currentRole} to ${newRole}`);
      return userRoleCookies.setUserRole(newRole, userId);
    }
    return true;
  }
};

// 🍎 iOS SESSION PERSISTENCE UTILITIES
export const iosSessionHelpers = {
  // Setup iOS-specific session persistence handlers
  setupIOSHandlers: (): (() => void) | undefined => {
    if (!isIOSDevice()) return undefined;
    
    console.log('[iOS] 🍎 Setting up iOS session persistence handlers');
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App became visible, refresh auth cookies
        const userRole = getCookie('userRole');
        const userId = getCookie('userRoleUserId');
        
        if (userRole && userId) {
          // Refresh the cookies to prevent Safari from clearing them
          userRoleCookies.setUserRole(userRole, userId);
          console.log('[iOS] 🔄 Refreshed session cookies on app focus');
        }
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from cache, refresh session
        handleVisibilityChange();
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    // Periodic refresh for iOS Safari (every 5 minutes)
    const refreshInterval = setInterval(() => {
      const userRole = getCookie('userRole');
      const userId = getCookie('userRoleUserId');
      
      if (userRole && userId) {
        userRoleCookies.setUserRole(userRole, userId);
      }
    }, 5 * 60 * 1000);

    // Return cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      clearInterval(refreshInterval);
      console.log('[iOS] 🧹 Cleaned up iOS session handlers');
    };
  },

  // Force refresh session for iOS
  refreshSession: (): void => {
    if (!isIOSDevice()) return;
    
    const userRole = getCookie('userRole');
    const userId = getCookie('userRoleUserId');
    
    if (userRole && userId) {
      userRoleCookies.setUserRole(userRole, userId);
      console.log('[iOS] 🔄 Force refreshed session');
    }
  }
};

// Cache keys and utilities for user profiles and permissions
const CACHE_EXPIRY = {
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
} as const;

const CACHE_KEYS = {
  CURRENT_USER: 'current_user',
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_PERMISSIONS: (userId: string) => `user_permissions_${userId}`,
  USER_THEME: (userId: string) => `user_theme_${userId}`,
  THEMES: 'available_themes',
  THEME_FONTS: 'theme_fonts',
  THEME_METADATA: 'theme_metadata',
} as const;

const USER_ROLE_CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `profile_${userId}`,
  USER_PERMISSIONS: (userId: string) => `permissions_${userId}`,
  USER_THEME: (userId: string) => `theme_${userId}`,
} as const;

export const cacheHelper = {
  cacheUserProfile: (userId: string, profileData: any): void => {
    storage.set(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId), profileData, CACHE_EXPIRY.HOUR, userId);
    console.log(`[CacheHelper] 👤 Cached profile for user ${userId.slice(-4)}`);
  },

  getCachedUserProfile: (userId: string): any | null => {
    return storage.get(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId), null, userId);
  },

  cacheUserPermissions: (userId: string, permissionsData: any): void => {
    storage.set(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId), permissionsData, CACHE_EXPIRY.HOUR, userId);
    console.log(`[CacheHelper] 🔐 Cached permissions for user ${userId.slice(-4)}`);
  },

  getCachedUserPermissions: (userId: string): any | null => {
    return storage.get(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId), null, userId);
  },

  cacheThemes: (themes: any[]): void => {
    storage.set(CACHE_KEYS.THEMES, themes, CACHE_EXPIRY.DAY);
    console.log(`[CacheHelper] 🎨 Cached ${themes.length} themes`);
  },

  getCachedThemes: (): any[] | null => {
    return storage.get(CACHE_KEYS.THEMES);
  },

  cacheThemeFonts: (fonts: any[]): void => {
    storage.set(CACHE_KEYS.THEME_FONTS, fonts, CACHE_EXPIRY.WEEK);
    console.log(`[CacheHelper] 🔤 Cached ${fonts.length} theme fonts`);
  },

  getCachedThemeFonts: (): any[] | null => {
    const fonts = storage.get(CACHE_KEYS.THEME_FONTS);
    if (fonts && Array.isArray(fonts)) {
      console.log(`[CacheHelper] 🔤 Retrieved ${fonts.length} theme fonts from cache`);
      return fonts;
    }
    return null;
  },

  cacheUserTheme: (userId: string, themeData: any): void => {
    storage.set(CACHE_KEYS.USER_THEME(userId), themeData, CACHE_EXPIRY.WEEK, userId);
    console.log(`[CacheHelper] 🎨 Cached theme for user ${userId.slice(-4)}`);
  },

  getCachedUserTheme: (userId: string): any | null => {
    return storage.get(CACHE_KEYS.USER_THEME(userId), null, userId);
  },

  invalidateThemeCaches: (): void => {
    console.log('[CacheHelper] 🎨 Invalidating theme caches...');
    storage.remove(CACHE_KEYS.THEMES);
    storage.remove(CACHE_KEYS.THEME_FONTS);
    storage.remove(CACHE_KEYS.THEME_METADATA);
    console.log('[CacheHelper] ✅ Theme caches invalidated');
  }
};

// Debug utilities
export const roleDebug = {
  getDebugInfo: (userId?: string): any => {
    return {
      cookies: { 
        userRole: getCookie('userRole'), 
        userRoleUserId: getCookie('userRoleUserId'), 
        themeId: getCookie('themeId'), 
        lastPage: getCookie('lastPage') 
      },
      storage: userId ? { 
        profile: storage.debug(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId)), 
        permissions: storage.debug(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId)) 
      } : null,
      validation: { 
        validRoles: VALID_USER_ROLES, 
        isRoleValid: userId ? userRoleCookies.isRoleValidForUser(userId) : 'N/A',
        isIOSDevice: isIOSDevice()
      }
    };
  },

  logDebugInfo: (userId?: string): void => {
    const info = roleDebug.getDebugInfo(userId);
    console.group('[RoleDebug] Complete Debug Information');
    console.log('Cookies:', info.cookies);
    console.log('Storage:', info.storage);
    console.log('Validation:', info.validation);
    console.groupEnd();
  }
};
// ADD THIS TO THE END OF YOUR lib/cookieUtils.ts FILE (before the final export/closing)

// 👤 PROFILE CACHE - Missing from your current file
export const profileCache = {
  setProfile: (userId: string, profileData: any): void => {
    storage.set(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId), profileData, CACHE_EXPIRY.HOUR, userId);
    if (profileData.role) userRoleCookies.setUserRole(profileData.role, userId);
    console.log(`[ProfileCache] 👤 Set profile for user ${userId.slice(-4)}`);
  },

  getProfile: (userId: string): any | null => {
    return storage.get(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId), null, userId);
  },

  setPermissions: (userId: string, permissions: any): void => {
    storage.set(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId), permissions, CACHE_EXPIRY.HOUR, userId);
    console.log(`[ProfileCache] 🔐 Set permissions for user ${userId.slice(-4)}`);
  },

  getPermissions: (userId: string): any | null => {
    return storage.get(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId), null, userId);
  },

  clearUserCaches: (userId: string): void => {
    storage.remove(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId));
    storage.remove(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId));
    userRoleCookies.clearUserRole();
    console.log(`[ProfileCache] 🗑️ Cleared caches for user ${userId.slice(-4)}`);
  }
};