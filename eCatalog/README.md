# eCatalog - Interactive Hospital Service Catalog

Modern web application for displaying hospital services, room rates, facilities, and contact information with dynamic category management.

## Features

- 🏥 **Category Management** - Room Rates, Facilities, Featured Services, Contact Persons
- 🎨 **White Label** - Customizable branding (logo, colors, hospital info)
- 🖼️ **Category Covers** - Upload custom cover images per category
- 🚧 **Coming Soon Mode** - Enable/disable individual categories
- 🔧 **Maintenance Mode** - Global on/off toggle for entire catalog
- 📱 **Responsive Design** - Mobile-first, works on all devices

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Netlify
- **Data Source**: Dashboard API

## Setup

### Local Development

1. **Clone repository**
   ```bash
   git clone https://github.com/ratt23/ecatalog.git
   cd ecatalog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```
   VITE_DASHBOARD_API=http://localhost:8888/.netlify/functions
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

### Production Deployment

**Netlify Deployment:**
1. Connect repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Environment variables:
   - `VITE_DASHBOARD_API`: Your Dashboard API URL

## Project Structure

```
eCatalog/
├── public/
│   └── asset/
│       ├── categories/    # Category cover images
│       └── logo/          # Hospital logo
├── src/
│   ├── components/
│   │   └── CategoryAccordion.jsx
│   ├── hooks/
│   │   ├── useCatalogItems.js
│   │   └── useWhiteLabel.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── netlify.toml
└── package.json
```

## Features in Detail

### Category Visibility Toggle
Admins can enable/disable categories from Dashboard. Disabled categories show "Coming Soon" message.

### Maintenance Mode
Global toggle to show/hide entire catalog with maintenance page.

### Dynamic Branding
- Hospital name, logo, theme color
- Fetched from Dashboard API
- Automatic fallback to defaults

## API Integration

eCatalog fetches data from Dashboard API:
- `/api/settings` - White label settings
- `/api/catalog-items` - Category items

## Development

**Available Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Code Style:**
- ESLint configured
- Prettier recommended

## License

All Rights Reserved © 2026 RSU Siloam Ambon
