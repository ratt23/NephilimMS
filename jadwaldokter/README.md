# RSU Siloam Ambon - Public Website

Website publik RSU Siloam Ambon untuk menampilkan jadwal dokter, artikel kesehatan, paket MCU, dan informasi rumah sakit.

## 🌐 Features

### Dynamic Content
- **Doctor Schedule** - Jadwal praktek dokter realtime
- **Doctor Leave Notifications** - Info dokter cuti dengan foto & spesialisasi
- **News & Articles** - Artikel kesehatan terkini
- **MCU Packages** - Paket Medical Check-Up dengan detail lengkap

### Client Settings Integration
- **Dynamic Theme** - Warna tema dari Admin Dashboard
- **Dynamic Menu** - Navigation menu configurable
- **Header Slides** - Info slider dengan teks & gambar
- **Feature Toggles** - GMB popup, doctor leave info

### User Experience
- **Responsive Design** - Mobile-first, optimized untuk semua device
- **PWA Ready** - Progressive Web App dengan offline support
- **Fast Loading** - Lazy load images, optimized assets
- **SEO Optimized** - Structured data, meta tags

## 🛠️ Tech Stack

React 18 + Vite | Tailwind CSS | React Router | Cloudinary CDN

## 📦 Quick Start

```bash
npm install
npm run dev
```

## 🔧 Configuration

**Environment Variables** (`.env`):
```env
VITE_API_BASE_URL=https://dashdev1.netlify.app/.netlify/functions
```

**API Endpoint**: Fetch settings from Admin Dashboard API

## 🎨 Dynamic Theming

CSS utilities using CSS variables:
- `.bg-primary` → `var(--primary-color)`  
- `.text-primary` → `var(--primary-color)`
- Set via Admin Dashboard

## 📱 Components

- `ConfigContext` - Global settings provider
- `Header` - Dynamic navigation & search
- `Footer` - Branding with links
- `DoctorModal` - Doctor details with schedule
- `McuPackageCard` - MCU package showcase
- `GmbWidget` - Google Reviews popup

## 🚢 Deployment

Auto-deploy to Netlify on push to `main` branch.

**Live Site**: [shab.web.id](https://shab.web.id)

## 📖 Documentation

- [CHANGELOG.md](./CHANGELOG.md) - Version history

## 👥 Credits

**Developer**: Marcomm SHAB | **Client**: RSU Siloam Ambon
