import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rih_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('rih_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, verify and refresh current user profile
    if (token) {
      apiClient.get('/users/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('rih_auth_user', JSON.stringify(res.data));
        })
        .catch(() => {
          // Token invalid or expired
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('rih_auth_token', access_token);
    localStorage.setItem('rih_auth_user', JSON.stringify(userData));
    return userData;
  };

  const loginWithPin = async (username, pin) => {
    const res = await apiClient.post('/auth/pin-login', {
      username: username.trim().toLowerCase(),
      pin: pin.trim(),
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('rih_auth_token', access_token);
    localStorage.setItem('rih_auth_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (registrationData) => {
    const cleanData = {
      ...registrationData,
      email: registrationData.email?.trim().toLowerCase(),
      username: registrationData.username?.trim().toLowerCase(),
      pin: registrationData.pin?.trim(),
      phone: registrationData.phone || registrationData.phone_number || '',
      phone_number: registrationData.phone_number || registrationData.phone || '',
      village_city: registrationData.village_city || registrationData.village_or_city || '',
      village_or_city: registrationData.village_or_city || registrationData.village_city || '',
      skills_expertise: registrationData.skills_expertise || registrationData.skills_or_expertise || '',
      skills_or_expertise: registrationData.skills_or_expertise || registrationData.skills_expertise || '',
      consent_given: registrationData.consent_given ?? registrationData.consent_accepted ?? true,
      consent_accepted: registrationData.consent_accepted ?? registrationData.consent_given ?? true,
    };
    const res = await apiClient.post('/auth/register', cleanData);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('rih_auth_token', access_token);
    localStorage.setItem('rih_auth_user', JSON.stringify(userData));
    return userData;
  };

  const verifyOtpAndRegister = async (registrationData, otpCode) => {
    const cleanData = {
      ...registrationData,
      otp_code: String(otpCode).trim(),
      email: registrationData.email?.trim().toLowerCase(),
      username: registrationData.username?.trim().toLowerCase(),
      pin: registrationData.pin?.trim(),
      phone: registrationData.phone || registrationData.phone_number || '',
      phone_number: registrationData.phone_number || registrationData.phone || '',
      village_city: registrationData.village_city || registrationData.village_or_city || '',
      village_or_city: registrationData.village_or_city || registrationData.village_city || '',
      skills_expertise: registrationData.skills_expertise || registrationData.skills_or_expertise || '',
      skills_or_expertise: registrationData.skills_or_expertise || registrationData.skills_expertise || '',
      consent_given: registrationData.consent_given ?? registrationData.consent_accepted ?? true,
      consent_accepted: registrationData.consent_accepted ?? registrationData.consent_given ?? true,
    };
    const res = await apiClient.post('/auth/verify-otp-register', cleanData);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('rih_auth_token', access_token);
    localStorage.setItem('rih_auth_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rih_auth_token');
    localStorage.removeItem('rih_auth_user');
  };

  const switchDemoAccount = async (email, password) => {
    return login(email, password);
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('rih_auth_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithPin,
        register,
        verifyOtpAndRegister,
        logout,
        switchDemoAccount,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isInnovator: user?.role === 'INNOVATOR',
        isInvestor: user?.role === 'INVESTOR',
        isMentor: user?.role === 'MENTOR',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
