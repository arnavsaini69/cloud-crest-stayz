import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface GoogleUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface TokenClientResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface TokenClientError {
  type?: string;
  message?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenClientResponse) => void;
            error_callback?: (error: TokenClientError) => void;
          }) => GoogleTokenClient;
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

interface AuthContextValue {
  user: GoogleUser | null;
  authLoading: boolean;
  signingIn: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => void;
  clearAuthError: () => void;
}

const SESSION_STORAGE_KEY = 'cloudcrest_google_user_v1';
const FALLBACK_GOOGLE_CLIENT_ID =
  '278148890851-fjjt13uj78vo3uf9lronkd42mnp4uol2.apps.googleusercontent.com';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getConfiguredClientId(): string {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (typeof envClientId === 'string' && envClientId.trim().length > 0) {
    return envClientId.trim();
  }
  return FALLBACK_GOOGLE_CLIENT_ID;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeAccessToken, setActiveAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<GoogleUser>;
        if (parsed.uid && parsed.email) {
          setUser({
            uid: parsed.uid,
            displayName: parsed.displayName || 'CloudCrest Member',
            email: parsed.email,
            ...(parsed.photoURL ? { photoURL: parsed.photoURL } : {}),
          });
        }
      }
    } catch {
      // Ignore malformed stored session
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);

    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      setAuthError(
        'Google Sign-In library is still loading. Please refresh the page and try again.'
      );
      return;
    }

    const clientId = getConfiguredClientId();
    setSigningIn(true);

    try {
      const tokenClient = oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: TokenClientResponse) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            setSigningIn(false);
            if (tokenResponse.error === 'access_denied') {
              setAuthError('Google sign-in permission was declined.');
            } else {
              setAuthError(
                tokenResponse.error_description ||
                  tokenResponse.error ||
                  'Unable to sign in with Google. Please try again.'
              );
            }
            return;
          }

          try {
            const res = await fetch(
              'https://www.googleapis.com/oauth2/v3/userinfo',
              {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              }
            );

            if (!res.ok) {
              throw new Error('Failed to retrieve your Google profile.');
            }

            const profile = (await res.json()) as {
              sub?: string;
              name?: string;
              email?: string;
              picture?: string;
            };

            if (!profile.sub || !profile.email) {
              throw new Error(
                'Google account did not return a verified email address.'
              );
            }

            const authenticatedUser: GoogleUser = {
              uid: profile.sub,
              displayName: (profile.name || 'CloudCrest Member').trim(),
              email: profile.email.trim(),
              ...(profile.picture ? { photoURL: profile.picture } : {}),
            };

            setActiveAccessToken(tokenResponse.access_token);
            setUser(authenticatedUser);
            try {
              window.localStorage.setItem(
                SESSION_STORAGE_KEY,
                JSON.stringify(authenticatedUser)
              );
            } catch {
              // Ignore storage quota errors
            }
          } catch (err) {
            setAuthError(
              err instanceof Error
                ? err.message
                : 'Unable to fetch your Google account profile.'
            );
          } finally {
            setSigningIn(false);
          }
        },
        error_callback: (err: TokenClientError) => {
          setSigningIn(false);
          if (err.type === 'popup_closed') {
            setAuthError(
              'Sign-in window was closed before completing Google registration.'
            );
          } else if (err.type === 'popup_failed_to_open') {
            setAuthError(
              'Browser blocked the Google sign-in popup. Allow popups for this site and try again.'
            );
          } else {
            const origin =
              typeof window !== 'undefined'
                ? window.location.origin
                : 'this domain';
            setAuthError(
              err.message ||
                `Unable to open Google Sign-In for ${origin}. Verify that VITE_GOOGLE_CLIENT_ID is configured and ${origin} is listed under Authorized JavaScript origins in Google Cloud Console.`
            );
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (error) {
      setSigningIn(false);
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Unable to initialize Google Sign-In.'
      );
    }
  }, []);

  const signOutUser = useCallback(() => {
    setAuthError(null);
    if (activeAccessToken && window.google?.accounts?.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(activeAccessToken);
      } catch {
        // Ignore revoke error
      }
    }
    setActiveAccessToken(null);
    setUser(null);
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }, [activeAccessToken]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        signingIn,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
