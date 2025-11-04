import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabase';

type SettingsMap = { [key: string]: string };

interface SiteSettingsContextType {
  settings: SettingsMap;
  loading: boolean;
  refreshSettings: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('site_settings').select('id, value');
    if (data) {
      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.id] = setting.value;
        return acc;
      }, {} as SettingsMap);
      setSettings(settingsMap);
    }
    if (error) {
      console.error('Error fetching site settings:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // FIX: Replace JSX with React.createElement to support .ts file extension and fix parsing errors.
  return React.createElement(SiteSettingsContext.Provider, { value: { settings, loading, refreshSettings: fetchSettings } }, children);
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
