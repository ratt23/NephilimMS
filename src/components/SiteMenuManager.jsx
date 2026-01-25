import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Trash, Plus, ArrowUp, ArrowDown, Type, Link as IconLink, Square } from 'lucide-react';
import { getApiBaseUrl } from '../utils/apiConfig';
// Using lucide-react (found in package.json) for icons in this new component

export default function SiteMenuManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({ label: '', url: '', icon: '' });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${getApiBaseUrl()}/settings`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                const menuJson = data['site_menu']?.value;
                if (menuJson) {
                    try {
                        setMenuItems(JSON.parse(menuJson));
                    } catch (e) {
                        console.error("Error parsing menu JSON", e);
                        setMenuItems([]);
                    }
                } else {
                    // Default Initial Menu if empty
                    setMenuItems([
                        { id: 1, label: 'Home', url: '/home', icon: 'home' },
                        { id: 2, label: 'MCU', url: '/mcu', icon: 'clipboard' },
                        { id: 3, label: 'Home Care', url: '/homecare', icon: 'heart' },
                        { id: 4, label: 'Article', url: '/article', icon: 'file-text' }
                    ]);
                }
            }
        } catch (err) {
            console.error("Failed to load settings", err);
        }
        setIsLoading(false);
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.label || !newItem.url) return;

        const item = {
            id: Date.now(),
            ...newItem
        };
        setMenuItems([...menuItems, item]);
        setNewItem({ label: '', url: '', icon: '' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this menu item?')) {
            setMenuItems(menuItems.filter(item => item.id !== id));
        }
    };

    const moveItem = (index, direction) => {
        const newItems = [...menuItems];
        if (direction === 'up' && index > 0) {
            [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        }
        setMenuItems(newItems);
    };

    const handleSave = async () => {
        setIsLoading(true);
        const payload = {
            site_menu: {
                value: JSON.stringify(menuItems),
                enabled: true
            }
        };

        try {
            const res = await fetch(`${getApiBaseUrl()}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Menu structure saved successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error saving menu.' });
        }
        setIsLoading(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto animate-fade-in font-sans">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold text-sanctum-text-curr">Site Menu Manager</h2>
                    <p className="text-sanctum-text-muted text-sm">Configure the navigation menu appearing on the client site (Footer/Header).</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-sanctum-accent hover:bg-blue-600 text-white px-6 py-2 rounded shadow-2xl-sm font-bold flex items-center gap-2"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : null}
                    Save Changes
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LIST / PREVIEW */}
                <div className="bg-sanctum-surface border border-sanctum-border rounded shadow-2xl-sm p-4">
                    <h3 className="text-sm font-bold text-sanctum-text-muted uppercase tracking-wider mb-4">Current Menu Structure</h3>

                    <div className="space-y-3">
                        {menuItems.length === 0 && <p className="text-sanctum-text-muted/60 italic text-sm text-center py-4">No menu items defined.</p>}

                        {menuItems.map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-sanctum-bg border border-sanctum-border rounded group hover:border-sanctum-accent transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-sanctum-primary text-white flex items-center justify-center rounded text-xs font-bold font-mono">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sanctum-text-curr">{item.label}</div>
                                        <div className="text-xs text-sanctum-text-muted font-mono">{item.url}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                                    <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowUp size={16} /></button>
                                    <button onClick={() => moveItem(index, 'down')} disabled={index === menuItems.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowDown size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"><Trash size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ADD NEW */}
                <div className="bg-sanctum-surface border border-sanctum-border rounded shadow-2xl-sm p-6 h-fit">
                    <h3 className="text-sm font-bold text-sanctum-text-muted uppercase tracking-wider mb-4">Add New Item</h3>
                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-sanctum-text-curr mb-1 flex items-center gap-1"><Type size={12} /> Label</label>
                            <input
                                type="text"
                                value={newItem.label}
                                onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                                className="w-full px-3 py-2 border border-sanctum-border rounded text-sm focus:ring-sanctum-accent focus:border-sanctum-accent bg-sanctum-bg text-sanctum-text-curr"
                                placeholder="e.g. Home"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-sanctum-text-curr mb-1 flex items-center gap-1"><IconLink size={12} /> URL</label>
                            <input
                                type="text"
                                value={newItem.url}
                                onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                className="w-full px-3 py-2 border border-sanctum-border rounded text-sm focus:ring-sanctum-accent focus:border-sanctum-accent bg-sanctum-bg text-sanctum-text-curr"
                                placeholder="e.g. /home or https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-sanctum-text-curr mb-1 flex items-center gap-1"><Square size={12} /> Icon Code (Optional)</label>
                            <input
                                type="text"
                                value={newItem.icon}
                                onChange={e => setNewItem({ ...newItem, icon: e.target.value })}
                                className="w-full px-3 py-2 border border-sanctum-border rounded text-sm focus:ring-sanctum-accent focus:border-sanctum-accent bg-sanctum-bg text-sanctum-text-curr"
                                placeholder="e.g. home, user, phone"
                            />
                            <p className="text-[10px] text-sanctum-text-muted/60 mt-1">Refers to icon names used in the client app.</p>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-sanctum-sidebar hover:bg-sanctum-bg text-sanctum-text-curr font-bold py-2 rounded flex items-center justify-center gap-2 text-sm border border-sanctum-border"
                        >
                            <Plus size={16} /> Add to Menu
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
