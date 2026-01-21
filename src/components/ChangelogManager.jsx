import React from 'react';

const CHANGELOG_DATA = [
    {
        version: 'v3.0.0',
        date: '2026-01-21',
        changes: [
            { type: 'feature', text: 'Rebranding: Complete rebrand to "NephilimMS - Born from Knowledge"' },
            { type: 'feature', text: 'Dark Theme: Nephilim theme with dark backgrounds and brass accents (#8C7A3E)' },
            { type: 'feature', text: 'Typography: Cinzel font for headings, Inter for body text' },
            { type: 'feature', text: 'UI: Joomla 5 Atum-inspired accordion sidebar navigation' },
            { type: 'improvement', text: 'Dashboard: All manager components updated to dark theme' },
            { type: 'improvement', text: 'Analytics: Traffic charts with dark theme and brass UI elements' },
            { type: 'improvement', text: 'Login: Complete dark theme with brass button accents' },
            { type: 'fix', text: 'eCatalog: Added getValidImageUrl export to imageUtils.js' },
            { type: 'fix', text: 'Theme: Fixed boxShadow syntax errors from batch update' },
        ]
    },
    {
        version: 'v2.6.0',
        date: '2026-01-15',
        changes: [
            { type: 'feature', text: 'Ad Management: Adsterra ad network integration (banner, in-article, video)' },
            { type: 'feature', text: 'Ad Management: Dashboard UI for AdSense and Adsterra configuration' },
            { type: 'feature', text: 'Ad Management: Global banner ad visibility toggle' },
            { type: 'feature', text: 'Ad Management: Adsterra async script mode with dynamic key support' },
            { type: 'feature', text: 'Ad Management: Adsterra iFrame mode with code textarea input' },
            { type: 'feature', text: 'Development: Ad placeholders showing network type (async/iframe) and slot ID' },
            { type: 'fix', text: 'eCatalog: Fixed delete functionality - removed duplicate GET endpoint blocking DELETE' },
            { type: 'fix', text: 'eCatalog: Added client-side filter to exclude soft-deleted items (is_active=false)' },
            { type: 'fix', text: 'eCatalog: Delete now properly soft-deletes and refreshes catalog list' },
            { type: 'fix', text: 'OneSignal: Fixed hostname typo (shah.web.id → shab.web.id)' },
            { type: 'fix', text: 'SEO: Added comprehensive robots meta tags with max-preview directives' },
            { type: 'improvement', text: 'Article SEO: Enhanced meta tags in ArticleView and ArticleDetailView' },
        ]
    },
    {
        version: 'v2.5.0',
        date: '2026-01-14',
        changes: [
            { type: 'feature', text: 'E-Catalog: Category cover images management from Dashboard' },
            { type: 'feature', text: 'E-Catalog: Hash-based URL routing for category navigation' },
            { type: 'feature', text: 'E-Catalog: Contact Person category with management interface' },
            { type: 'feature', text: 'E-Catalog: Item reordering with up/down arrows' },
            { type: 'feature', text: 'E-Catalog: Default sort order for Tarif Kamar (Kelas 3→2→1→VIP→VVIP)' },
            { type: 'feature', text: 'Analytics: Today stats column in visitor dashboard' },
            { type: 'feature', text: 'Analytics: Monthly Traffic Report with accordion view (6 months)' },
            { type: 'improvement', text: 'E-Catalog: Typography using Poppins font for consistency' },
            { type: 'improvement', text: 'E-Catalog: Standardized content section spacing (200px)' },
            { type: 'improvement', text: 'E-Catalog: Removed redundant section titles (already in header)' },
            { type: 'fix', text: 'API: Fixed /catalog/reorder 404 error' },
            { type: 'fix', text: 'Database: Added ORDER BY sort_order to catalog items query' },
            { type: 'fix', text: 'Images: Fixed legacy image sync issue (DB reset & placeholder fallback)' },
            { type: 'fix', text: 'Items: Reset legacy hardcoded item images (e.g. CT Scan)' },
            { type: 'fix', text: 'Upload: Fixed multiple simultaneous uploads & object bug' },
            { type: 'fix', text: 'App: Fixed missing closing main tag in eCatalog layout' },
            { type: 'fix', text: 'ECatalog: Fixed CATEGORIES ReferenceError in Items Manager' },
            { type: 'fix', text: 'Settings: Fixed missing Trash2 icon import' },
            { type: 'improvement', text: 'UI: Removed legacy Maintenance Mode toggle' },
        ]
    },
    {
        version: 'v1.3.0',
        date: '2026-01-05',
        changes: [
            { type: 'feature', text: 'Settings Manager reorganized with Accordion UI for better navigation' },
            { type: 'feature', text: 'TV Manager: Device soft-delete - devices reappear on next heartbeat' },
            { type: 'feature', text: 'Live Preview iframe isolation - preview mode no longer creates new devices' },
            { type: 'feature', text: 'Manager Title white-labeling configuration added' },
        ]
    },
    {
        version: 'v1.2.0',
        date: '2026-01-04',
        changes: [
            { type: 'feature', text: 'Pin and Rename functionality for TV devices' },
            { type: 'feature', text: 'Live Preview modal with iframe simulation' },
            { type: 'feature', text: 'Promo image ordering by sort_order field' },
            { type: 'improvement', text: 'Slideshow cycle logic refined to skip videos after promos' },
        ]
    },
    {
        version: 'v1.1.0',
        date: '2026-01-03',
        changes: [
            { type: 'feature', text: 'Slideshow & TV Manager (SSTV Manager) with device monitoring' },
            { type: 'feature', text: 'Device heartbeat tracking and status reporting' },
            { type: 'feature', text: 'Remote refresh trigger for TV devices' },
            { type: 'feature', text: 'Slideshow refresh interval configuration' },
        ]
    },
    {
        version: 'v1.0.0',
        date: '2026-01-01',
        changes: [
            { type: 'feature', text: 'Initial CatMS release' },
            { type: 'feature', text: 'Doctor and Leave Management' },
            { type: 'feature', text: 'MCU Package Management' },
            { type: 'feature', text: 'News/Blog Post Manager' },
            { type: 'feature', text: 'AdSense & Pop-up Ads Management' },
            { type: 'feature', text: 'Settings Manager with White-Label Support' },
        ]
    }
];

const ChangeTypeIcon = ({ type }) => {
    switch (type) {
        case 'feature':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            );
        case 'improvement':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M12 20v-6M6 20V10M18 20V4"></path>
                </svg>
            );
        case 'fix':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
            );
        default:
            return null;
    }
};

export default function ChangelogManager() {
    return (
        <div className="space-y-6 animate-fade-in font-sans p-6">
            {/* HEADER */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#E6E6E3] flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                    Changelog
                </h2>
                <p className="text-sm text-[#a0a4ab] mt-1">Version history and system updates</p>
            </div>

            {/* CHANGELOG TIMELINE */}
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Versions */}
                <div className="space-y-8">
                    {CHANGELOG_DATA.map((release, idx) => (
                        <div key={release.version} className="relative pl-16">
                            {/* Version Dot */}
                            <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-4 border-white ${idx === 0 ? 'bg-[#8C7A3E]' : 'bg-gray-400'}`}></div>

                            {/* Card */}
                            <div className={`bg-[#1a1d21] border ${idx === 0 ? 'border-blue-200 shadow-2xl-md' : 'border-[#8C7A3E]/20 shadow-2xl-sm'} rounded-lg p-6 transition-all hover:shadow-2xl-md`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className={`text-lg font-bold ${idx === 0 ? 'text-blue-700' : 'text-[#E6E6E3]'}`}>{release.version}</h3>
                                        {idx === 0 && (
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">LATEST</span>
                                        )}
                                    </div>
                                    <span className="text-sm text-[#a0a4ab] font-mono">{release.date}</span>
                                </div>

                                {/* Changes List */}
                                <ul className="space-y-2">
                                    {release.changes.map((change, changeIdx) => (
                                        <li key={changeIdx} className="flex items-start gap-2 text-sm text-[#E6E6E3]">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <ChangeTypeIcon type={change.type} />
                                            </div>
                                            <span>{change.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-[#0B0B0C] border border-[#8C7A3E]/20 rounded-lg p-4 text-sm text-[#a0a4ab] mt-8">
                <p className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <strong>Note:</strong> This changelog tracks major features and improvements. For detailed technical changes, please consult the development repository.
                </p>
            </div>
        </div>
    );
}
