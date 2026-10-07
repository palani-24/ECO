/**
 * Unified Per-Page Dynamic Background Registry
 * Automatically maps each route to its unique, high-resolution aesthetic background image
 * with customized atmospheric overlays, blur levels, and ambient lighting.
 */

export const PAGE_BACKGROUNDS = {
  // 🌿 User / Citizen Routes
  '/dashboard': {
    image: '/images/eco_portal_ambient_bg.jpg',
    alt: 'Eco Dashboard Nature Landscape',
    overlay: 'bg-gradient-to-b from-white/10 via-white/5 to-slate-900/20 dark:from-slate-950/30 dark:via-slate-950/15 dark:to-slate-950/45',
    blur: 'brightness(1.05) saturate(1.15)',
    orbs: {
      c1: 'bg-emerald-400/20 dark:bg-emerald-500/15',
      c2: 'bg-teal-400/20 dark:bg-teal-500/15',
      c3: 'bg-sky-400/15 dark:bg-emerald-600/15'
    }
  },
  '/schedule-pickup': {
    image: '/images/page_bgs/eco_pickup_schedule_bg.jpg',
    alt: 'Doorstep EV Waste Collection Avenue',
    overlay: 'bg-gradient-to-b from-white/50 via-white/30 to-slate-950/25 dark:from-slate-950/70 dark:to-slate-950/85',
    blur: 'brightness(0.98) saturate(1.12) blur-[1px]',
    orbs: {
      c1: 'bg-emerald-500/20 dark:bg-emerald-500/15',
      c2: 'bg-lime-400/15 dark:bg-lime-500/10',
      c3: 'bg-teal-500/15 dark:bg-teal-600/10'
    }
  },
  '/my-pickups': {
    image: '/images/gps_city_map_bg.jpg',
    alt: 'Live GPS City Tracking Map',
    overlay: 'bg-gradient-to-b from-white/55 via-white/35 to-slate-950/30 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(1.0) saturate(1.08) blur-[1.5px]',
    orbs: {
      c1: 'bg-cyan-400/15 dark:bg-cyan-500/10',
      c2: 'bg-emerald-500/15 dark:bg-emerald-600/10',
      c3: 'bg-blue-500/10 dark:bg-blue-600/10'
    }
  },
  '/redeem': {
    image: '/images/custom_eco_waves_bg.png',
    alt: 'EcoPoints Digital Rewards Vault',
    overlay: 'bg-gradient-to-b from-white/40 via-white/20 to-emerald-950/20 dark:from-slate-950/65 dark:to-slate-950/85',
    blur: 'brightness(1.02) saturate(1.12)',
    orbs: {
      c1: 'bg-amber-400/15 dark:bg-amber-500/10',
      c2: 'bg-emerald-400/20 dark:bg-emerald-500/15',
      c3: 'bg-yellow-400/10 dark:bg-yellow-500/10'
    }
  },
  '/store': {
    image: '/images/page_bgs/eco_store_bg.jpg',
    alt: 'Minimalist Sustainable Eco-Store Showcase',
    overlay: 'bg-gradient-to-b from-white/50 via-white/30 to-slate-950/20 dark:from-slate-950/70 dark:to-slate-950/85',
    blur: 'brightness(0.98) saturate(1.1) blur-[1px]',
    orbs: {
      c1: 'bg-emerald-400/15 dark:bg-emerald-500/10',
      c2: 'bg-teal-300/15 dark:bg-teal-400/10',
      c3: 'bg-green-400/10 dark:bg-green-500/10'
    }
  },
  '/report-dump': {
    image: '/images/mountain_vector_auth_bg.jpg',
    alt: 'Pristine Clean Earth & Civic Reporting',
    overlay: 'bg-gradient-to-b from-white/45 via-white/25 to-slate-950/25 dark:from-slate-950/70 dark:to-slate-950/90',
    blur: 'brightness(0.98) saturate(1.05) blur-[1.2px]',
    orbs: {
      c1: 'bg-rose-400/15 dark:bg-rose-500/10',
      c2: 'bg-emerald-500/15 dark:bg-emerald-600/10',
      c3: 'bg-amber-400/10 dark:bg-amber-500/10'
    }
  },
  '/support': {
    image: '/images/eco_portal_ambient_bg.jpg',
    alt: 'Citizen Care & Helpdesk Support Portal',
    overlay: 'bg-gradient-to-b from-white/45 via-white/25 to-slate-950/25 dark:from-slate-950/65 dark:to-slate-950/85',
    blur: 'brightness(1.0) saturate(1.08)',
    orbs: {
      c1: 'bg-teal-400/15 dark:bg-teal-500/10',
      c2: 'bg-sky-400/15 dark:bg-sky-500/10',
      c3: 'bg-emerald-500/10 dark:bg-emerald-600/10'
    }
  },
  '/leaderboard': {
    image: '/images/page_bgs/eco_leaderboard_bg.jpg',
    alt: 'Eco Champions Awards Hall & Podium',
    overlay: 'bg-gradient-to-b from-white/50 via-white/30 to-slate-950/25 dark:from-slate-950/70 dark:to-slate-950/85',
    blur: 'brightness(0.98) saturate(1.12) blur-[1px]',
    orbs: {
      c1: 'bg-amber-400/20 dark:bg-amber-500/15',
      c2: 'bg-emerald-400/20 dark:bg-emerald-500/15',
      c3: 'bg-lime-400/15 dark:bg-lime-500/10'
    }
  },
  '/esg-portal': {
    image: '/images/eco_admin_bg.jpg',
    alt: 'Corporate Sustainability & ESG Reporting Architecture',
    overlay: 'bg-gradient-to-b from-white/50 via-white/25 to-slate-950/35 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(0.95) saturate(1.1) blur-[1px]',
    orbs: {
      c1: 'bg-teal-500/15 dark:bg-teal-600/10',
      c2: 'bg-indigo-500/15 dark:bg-indigo-600/10',
      c3: 'bg-emerald-500/15 dark:bg-emerald-600/10'
    }
  },
  '/challenges': {
    image: '/images/citizen/virtual_eco_tree.jpg',
    alt: 'Community Forest & Sustainability Missions',
    overlay: 'bg-gradient-to-b from-white/45 via-white/25 to-slate-950/30 dark:from-slate-950/70 dark:to-slate-950/85',
    blur: 'brightness(1.0) saturate(1.08) blur-[1px]',
    orbs: {
      c1: 'bg-emerald-500/20 dark:bg-emerald-600/15',
      c2: 'bg-green-400/15 dark:bg-green-500/10',
      c3: 'bg-lime-400/15 dark:bg-lime-500/10'
    }
  },
  '/profile': {
    image: '/images/mountain_landscape_bg.jpg',
    alt: 'Serene Green Mountain Landscape',
    overlay: 'bg-gradient-to-b from-white/45 via-white/25 to-slate-950/30 dark:from-slate-950/70 dark:to-slate-950/85',
    blur: 'brightness(1.0) saturate(1.08) blur-[1px]',
    orbs: {
      c1: 'bg-emerald-400/15 dark:bg-emerald-500/10',
      c2: 'bg-teal-400/15 dark:bg-teal-500/10',
      c3: 'bg-sky-400/15 dark:bg-sky-500/10'
    }
  },

  // 🏛️ Municipality Command Routes
  '/municipality/dashboard': {
    image: '/images/eco_admin_bg.jpg',
    alt: 'Municipality Smart City Command Center',
    overlay: 'bg-gradient-to-b from-white/50 via-white/25 to-slate-950/35 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(0.95) saturate(1.1)',
    orbs: {
      c1: 'bg-emerald-500/20 dark:bg-emerald-600/15',
      c2: 'bg-teal-500/15 dark:bg-teal-600/10',
      c3: 'bg-sky-500/15 dark:bg-sky-600/10'
    }
  },
  '/municipality/heatmap': {
    image: '/images/gps_city_map_bg.jpg',
    alt: 'GIS Ward Solid Waste Heatmap',
    overlay: 'bg-gradient-to-b from-white/55 via-white/30 to-slate-950/35 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(0.95) saturate(1.08) blur-[1px]',
    orbs: {
      c1: 'bg-rose-500/15 dark:bg-rose-600/10',
      c2: 'bg-amber-500/15 dark:bg-amber-600/10',
      c3: 'bg-emerald-500/15 dark:bg-emerald-600/10'
    }
  },
  '/municipality/grievances': {
    image: '/images/mountain_vector_auth_bg.jpg',
    alt: 'Ward Citizen Grievance Resolution',
    overlay: 'bg-gradient-to-b from-white/50 via-white/25 to-slate-950/35 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(0.95) saturate(1.05) blur-[1px]',
    orbs: {
      c1: 'bg-orange-500/15 dark:bg-orange-600/10',
      c2: 'bg-emerald-500/15 dark:bg-emerald-600/10',
      c3: 'bg-teal-500/15 dark:bg-teal-600/10'
    }
  },
  '/municipality/support': {
    image: '/images/eco_portal_ambient_bg.jpg',
    alt: 'Officer Command & Support Hub',
    overlay: 'bg-gradient-to-b from-white/50 via-white/25 to-slate-950/35 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(1.0) saturate(1.08)',
    orbs: {
      c1: 'bg-teal-400/15 dark:bg-teal-500/10',
      c2: 'bg-sky-400/15 dark:bg-sky-500/10',
      c3: 'bg-emerald-500/15 dark:bg-emerald-600/10'
    }
  },

  // 🚚 Driver Routes
  '/driver': {
    image: '/images/page_bgs/eco_pickup_schedule_bg.jpg',
    alt: 'EV Driver Fleet Telematics Cockpit',
    overlay: 'bg-gradient-to-b from-white/50 via-white/25 to-slate-950/35 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(0.95) saturate(1.12) blur-[1px]',
    orbs: {
      c1: 'bg-emerald-500/20 dark:bg-emerald-600/15',
      c2: 'bg-teal-400/15 dark:bg-teal-500/10',
      c3: 'bg-sky-400/15 dark:bg-sky-500/10'
    }
  },
  '/driver/pickups': {
    image: '/images/gps_city_map_bg.jpg',
    alt: 'Assigned Driver Doorstep Pickups',
    overlay: 'bg-gradient-to-b from-white/55 via-white/30 to-slate-950/35 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(0.95) saturate(1.08) blur-[1px]',
    orbs: {
      c1: 'bg-emerald-500/20 dark:bg-emerald-600/15',
      c2: 'bg-cyan-400/15 dark:bg-cyan-500/10',
      c3: 'bg-sky-500/15 dark:bg-sky-600/10'
    }
  },
  '/driver/gate-pass': {
    image: '/images/eco_admin_bg.jpg',
    alt: 'Eco Hub Gate Pass QR Depot',
    overlay: 'bg-gradient-to-b from-white/50 via-white/25 to-slate-950/35 dark:from-slate-950/75 dark:to-slate-950/90',
    blur: 'brightness(0.95) saturate(1.1)',
    orbs: {
      c1: 'bg-indigo-500/15 dark:bg-indigo-600/10',
      c2: 'bg-emerald-500/20 dark:bg-emerald-600/15',
      c3: 'bg-teal-400/15 dark:bg-teal-500/10'
    }
  },
  '/driver/earnings': {
    image: '/images/custom_eco_waves_bg.png',
    alt: 'Driver Earnings & Cashout',
    overlay: 'bg-gradient-to-b from-white/45 via-white/20 to-emerald-950/25 dark:from-slate-950/70 dark:to-slate-950/85',
    blur: 'brightness(1.02) saturate(1.12)',
    orbs: {
      c1: 'bg-emerald-500/20 dark:bg-emerald-600/15',
      c2: 'bg-amber-400/15 dark:bg-amber-500/10',
      c3: 'bg-lime-400/15 dark:bg-lime-500/10'
    }
  },

  // 🛡️ Admin Routes
  '/admin': {
    image: '/images/eco_admin_bg.jpg',
    alt: 'System Admin Central Hub',
    overlay: 'bg-gradient-to-b from-white/50 via-white/25 to-slate-950/35 dark:from-slate-950/80 dark:to-slate-950/95',
    blur: 'brightness(0.95) saturate(1.1)',
    orbs: {
      c1: 'bg-emerald-500/20 dark:bg-emerald-600/15',
      c2: 'bg-indigo-500/15 dark:bg-indigo-600/10',
      c3: 'bg-teal-500/15 dark:bg-teal-600/10'
    }
  }
};

/**
 * Returns the configured background metadata for any given route pathname,
 * with fallback to the elegant ambient curves background.
 *
 * @param {string} pathname Current route path (e.g., location.pathname)
 * @param {string|object} [override] Optional custom background image or object override
 * @returns {object} { image, alt, overlay, blur, orbs }
 */
export function getPageBackground(pathname, override) {
  if (typeof override === 'string' && override) {
    return {
      image: override,
      alt: 'Custom Page Background',
      overlay: 'bg-gradient-to-b from-white/35 via-white/15 to-slate-950/25 dark:from-slate-950/70 dark:to-slate-950/85',
      blur: 'brightness(1.0) saturate(1.05)',
      orbs: {
        c1: 'bg-emerald-400/15 dark:bg-emerald-500/10',
        c2: 'bg-teal-400/15 dark:bg-teal-500/10',
        c3: 'bg-sky-400/10 dark:bg-emerald-600/10'
      }
    };
  }

  if (override && typeof override === 'object' && override.image) {
    return override;
  }

  // Exact match
  if (PAGE_BACKGROUNDS[pathname]) {
    return PAGE_BACKGROUNDS[pathname];
  }

  // Prefix match (e.g., /admin/users -> /admin, /driver/history -> /driver)
  const matchingPrefix = Object.keys(PAGE_BACKGROUNDS)
    .filter(route => route !== '/dashboard' && pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  if (matchingPrefix) {
    return PAGE_BACKGROUNDS[matchingPrefix];
  }

  // Default fallback
  return PAGE_BACKGROUNDS['/dashboard'];
}
