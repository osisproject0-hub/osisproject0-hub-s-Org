import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { SiteSetting } from '../../types';
import Spinner from '../../components/Spinner';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const ManageSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<SiteSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState('');
    const { refreshSettings } = useSiteSettings();

    const fetchSettingsData = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('site_settings').select('*').order('group').order('label');
        if (data) {
            setSettings(data);
        } else {
            console.error(error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSettingsData();
    }, [fetchSettingsData]);

    const handleInputChange = (id: string, value: string) => {
        setSettings(prevSettings =>
            prevSettings.map(setting =>
                setting.id === id ? { ...setting, value } : setting
            )
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setNotification('');
        
        const { error } = await supabase.from('site_settings').upsert(
            settings.map(({ id, value, label, group }) => ({ id, value, label, group }))
        );

        if (error) {
            setNotification('Gagal menyimpan pengaturan: ' + error.message);
        } else {
            setNotification('Pengaturan berhasil disimpan!');
            refreshSettings(); // Refresh settings globally
        }
        setSaving(false);
        setTimeout(() => setNotification(''), 3000);
    };

    // FIX: The previous reduce logic was causing type inference issues. Replaced with a for...of loop for robust grouping.
    const groupedSettings: Record<string, SiteSetting[]> = {};
    for (const setting of settings) {
        if (!groupedSettings[setting.group]) {
            groupedSettings[setting.group] = [];
        }
        groupedSettings[setting.group].push(setting);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Pengaturan Website</h1>
                <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {saving ? <Spinner /> : 'Simpan Perubahan'}
                </button>
            </div>

            {notification && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{notification}</span>
                </div>
            )}
            
            {loading ? <Spinner /> : (
                <div className="space-y-8">
                    {Object.entries(groupedSettings).map(([group, settingsInGroup]) => (
                        <div key={group} className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-6 border-b pb-3">{group}</h2>
                            <div className="space-y-4">
                                {settingsInGroup.map(setting => (
                                    <div key={setting.id}>
                                        <label htmlFor={setting.id} className="block text-sm font-medium text-gray-700">{setting.label}</label>
                                        {setting.id.includes('content') || setting.id.includes('description') || setting.id.includes('missions') ? (
                                             <textarea
                                                id={setting.id}
                                                value={setting.value}
                                                onChange={(e) => handleInputChange(setting.id, e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-24"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                id={setting.id}
                                                value={setting.value}
                                                onChange={(e) => handleInputChange(setting.id, e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        )}
                                         {setting.id.includes('missions') && <p className="text-xs text-gray-500 mt-1">Gunakan format JSON Array, contoh: ["Misi 1", "Misi 2"]</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageSettingsPage;