# Changelog - Admin Dashboard

All notable changes to the RSU Siloam Ambon Admin Dashboard.

## [2.5.0] - 2026-01-14

### Added - eCatalog Major Update
- **Category Cover Images Management**: Dashboard interface untuk upload dan manage cover images untuk 4 kategori eCatalog (Tarif Kamar, Fasilitas, Layanan Unggulan, Contact Person)
- **URL Routing**: Hash-based routing untuk navigasi category dengan browser back/forward support (`/#/tarif-kamar`, `/#/fasilitas`, dll)
- **Contact Person Category**: Tab baru di ECatalogItemsManager untuk manage contact person data
- **Item Reordering**: Drag & drop dengan arrow buttons untuk customize urutan items di setiap kategori
- **Default Sort Order**: Auto-sort Tarif Kamar (Kelas 3 → 2 → 1 → VIP → VVIP)
- **Today Stats**: Kolom statistik "Today" di visitor analytics dashboard

### Changed - eCatalog
- **Typography**: E-CATALOG title menggunakan font Poppins weight 700, size text-xl (matching jadwaldokter)
- **Branding**: Semua references diubah ke "RSU Siloam Ambon" (full name)
- **Spacing**: Standardized content section spacing (200px margin-top, 20px gap dari header)
- **UI Cleanup**: Removed redundant section titles (sudah ada di fixed header)
- **Maintenance Mode**: Removed legacy "Status E-Catalog" toggle from Dashboard UI
- **Image Handling**: Removed all hardcoded legacy image paths; now strictly uses placeholders or database values

### Fixed
- **API Endpoint**: Fixed `/catalog/reorder` 404 error dengan memindahkan endpoint keluar dari catalog-items block
- **Sort Order Query**: Added `ORDER BY sort_order ASC` ke catalog items query
- **Image Sync**: Resolved issue where deleted legacy images were still referenced by database (reset DB to defaults)
- **Item Images**: Reset legacy local image paths for Catalog Items (e.g. CT Scan) to placeholders
- **Cover Upload**: Fixed `[object Object]` bug where Cloudinary response was not parsed correctly
- **Upload UI**: Refactored to support **Multiple Simultaneous Uploads** (non-blocking UI)
- **Placeholder Fallback**: Added robust `onError` handlers in both Client and Dashboard to ensure broken images fallback to `placeholder.svg`
- **App Layout**: Fixed missing closing `</main>` tag in `App.jsx`
- **ECatalog**: Fixed `ReferenceError: CATEGORIES` in `ECatalogItemsManager` by using state variable
- **Settings**: Fixed `ReferenceError: Trash2` in `SettingsManager` by adding missing import

### API Changes
- **New Endpoint**: `POST /.netlify/functions/api/catalog/reorder` untuk update item order
- **Settings**: Added `category_covers` JSON field untuk store custom category images

---

## [2.0.0] - 2026-01-04

### Added - MCU Package Manager
- **MCU Package Manager** - Complete CRUD system for Medical Check-Up packages
  - Database table `mcu_packages` with JSONB fields for items and addons
  - 5 API endpoints (GET public/admin, POST, PUT, DELETE)
  - Admin UI with table view and full-featured modal
  - Cloudinary image upload with preview
  - Dynamic items/categories management with hidden toggle
  - Dynamic add-ons management (id, label, price)
  - Display order for package sorting
  - Pelaut & Recommended flags
  - Soft delete (disable) functionality
  - Seeded with 6 default packages (Pelaut, Basic, Silver, Gold, Platinum Wanita, Platinum Pria)

### Added - Control Panel Card
- MCU Packages quick access card in Control Panel dashboard

### Fixed
- **Submodule Issue** - Removed jadwaldokter-main embedded git repository causing Netlify build failures
- **Migration Script** - Fixed migrate_mcu.js to use `postgres` instead of `@neondatabase/serverless`
- **JSONB Parsing** - Added parseJsonField() helper to handle database JSONB string conversion
- **Image Preview** - Added fallback placeholder for relative image paths

### Changed
- Updated `.gitignore` in both repos to prevent cross-contamination
  - schedule-project ignores `jadwaldokter-main/`
  - jadwaldokter ignores `schedule-project/`

## [1.5.0] - 2026-01-03

### Added - Client Settings Integration
- **Dynamic Theme Color** - Client website uses `--primary-color` CSS variable from Admin settings
- **Dynamic Menu** - Navigation menu configured from Admin Dashboard
- **GMB Toggle** - Google Review popup controlled via feature toggle
- **Header Slides** - Dynamic header info slider content

### Fixed - Client App
- `ConfigContext.jsx` - Added menu and googleReview feature fetching
- `Header.jsx` - Dynamic navigation from config.menu with theme colors
- `Footer.jsx` - Using bg-primary for dynamic theming
- `CategoryNav.jsx` - Using bg-primary
- `SpecialistList.jsx` - Using bg-primary for specialist buttons
- `GmbWidget.jsx` - Feature toggle check

### Added - CSS Utilities
- `.bg-primary`, `.text-primary`, `.border-primary`, `.from-primary` classes
- All reference `var(--primary-color)` with fallback to `#01007f`

## [1.4.0] - 2025-12-30

### Added - OneSignal Notifications
- Push notification integration with OneSignal
- Auto-notify when doctor leave is saved
- Manual push notification manager

### Fixed
- Settings Manager GMB toggle logic
- LivePreview props for feature flags
- Header slide deletion syntax error

## [1.3.0] - 2025-12-22

### Added - Site Menu Manager
- Dynamic menu configuration for client website
- Reorder, add, remove menu items

### Added - Pop-Up Ads Manager
- Upload pop-up ad image to Cloudinary
- Toggle active/inactive status
- Public API endpoint for client website

### Added - Settings Manager
- Site logo URL
- Theme color picker
- Header info slider (text & url slides)
- Doctor priority ordering
- Feature toggles (Polyclinic Today, Doctor Leave, GMB)

## [1.2.0] - 2025-12-05

### Added - News/Blog System
- Post Manager with category and tags
- Rich content support
- Published/draft status

### Added - AdSense Manager
- Configure AdSense script
- Enable/disable ads globally

## [1.1.0] - 2025-11-20

### Added - Doctor & Leave Management
- Doctor CRUD with Cloudinary image upload
- Weekly schedule management
- Leave/cuti CRUD with date range
- Auto-fetch doctor specialties

## [1.0.0] - 2025-11-01

### Initial Release
- Dashboard authentication
- SSTV (Slideshow) Manager
- Promo Manager
- Basic API structure
- Netlify Functions backend
- Neon PostgreSQL integration
