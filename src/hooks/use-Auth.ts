import { useState, useEffect } from 'react';
import { UserAuth, UserProfile } from '../types.ts';
import { loginAccount, registerAccount } from '../services/account.service.ts';
import { getProfile } from '../services/profile.service.ts';

export function useAuth() {
  const [userAuth, setUserAuth] = useState<UserAuth>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('userAuth');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return {
      isAuthenticated: false,
      name: 'नागरिक / Citizen',
      phone: '',
      state: 'Haryana'
    };
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('userProfile');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return {
      name: 'नागरिक / Citizen',
      state: 'Haryana',
      occupation: 'Street Vendor',
      monthly_income: 15000,
      monthlyIncome: 15000,
      children_count: 2,
      children: 2,
      age: 34,
      gender: 'MALE',
      rawInput: 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।',
      inputMode: 'voice'
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userAuth', JSON.stringify(userAuth));
    }
  }, [userAuth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  const handleLoginSuccess = (authData: UserAuth) => {
    setUserAuth(authData);
    setUserProfile(prev => ({
      ...prev,
      name: authData.name,
      state: authData.state || prev.state
    }));
  };

  const handleLogout = () => {
    setUserAuth({
      isAuthenticated: false,
      name: 'नागरिक / Citizen',
      phone: '',
      state: 'Haryana'
    });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refreshToken');
      window.localStorage.removeItem('refresh_token');
      window.localStorage.removeItem('userAuth');
      window.localStorage.removeItem('userProfile');
    }
  };

  const authenticate = async (
    mode: 'login' | 'signup',
    credentials: { email: string; password: string }
  ): Promise<UserAuth> => {
    if (mode === 'signup') {
      await registerAccount(credentials);
    }

    const loginResponse = await loginAccount(credentials);
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('accessToken', loginResponse.access_token);
      window.localStorage.setItem('access_token', loginResponse.access_token);
      window.localStorage.setItem('refreshToken', loginResponse.refresh_token);
      window.localStorage.setItem('refresh_token', loginResponse.refresh_token);
    }

    let profile;
    try {
      profile = await getProfile(loginResponse.id);
    } catch (e) {
      console.warn("Profile not found or could not be fetched", e);
    }

    return {
      isAuthenticated: true,
      id: loginResponse.id,
      email: loginResponse.email,
      access_token: loginResponse.access_token,
      refresh_token: loginResponse.refresh_token,
      name: profile && profile.occupation ? `${profile.occupation} (${profile.state})` : loginResponse.email.split('@')[0],
      state: profile?.state || 'Maharashtra'
    };
  };

  const quickLogin = async (role: 'farmer' | 'vendor' | 'artisan'): Promise<UserAuth> => {
    const emailByRole = {
      farmer: 'farmer@sahayak.gov.in',
      vendor: 'vendor@sahayak.gov.in',
      artisan: 'artisan@sahayak.gov.in'
    } as const;
    
    const loginResponse = await loginAccount({
      email: emailByRole[role],
      password: 'password123'
    });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('accessToken', loginResponse.access_token);
      window.localStorage.setItem('access_token', loginResponse.access_token);
      window.localStorage.setItem('refreshToken', loginResponse.refresh_token);
      window.localStorage.setItem('refresh_token', loginResponse.refresh_token);
    }

    let profile;
    try {
      profile = await getProfile(loginResponse.id);
    } catch (e) {
      console.warn("Profile not found or could not be fetched for quick login", e);
    }

    return {
      isAuthenticated: true,
      id: loginResponse.id,
      email: loginResponse.email,
      access_token: loginResponse.access_token,
      refresh_token: loginResponse.refresh_token,
      name: profile && profile.occupation ? `${profile.occupation} (${profile.state})` : emailByRole[role].split('@')[0],
      state: profile?.state || (role === 'vendor' ? 'Haryana' : role === 'farmer' ? 'Maharashtra' : 'Rajasthan')
    };
  };

  return {
    userAuth,
    userProfile,
    setUserProfile,
    handleLoginSuccess,
    handleLogout,
    authenticate,
    quickLogin
  };
}
