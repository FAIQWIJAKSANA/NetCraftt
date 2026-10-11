export const COLORS = {
  // Base Palette (Slate Dark Mode - Blue Tinted, Professional & Colorful)
  background: '#0F172A',    // Slate 900 (Deep Blue-Gray)
  surface: '#1E293B',       // Slate 800 (Rich Blue-Gray for cards)
  surfaceLight: '#334155',  // Slate 700 (Lighter items)
  surfaceBorder: '#475569', // Slate 600 (Visible borders)

  // Brand Accents (Vibrant & Eye-catching)
  primary: '#6366F1',       // Indigo 500 (Vibrant, professional, readable with white text)
  primaryDark: '#4F46E5',   // Indigo 600
  secondary: '#10B981',     // Emerald 500 (Success)
  secondaryLight: '#34D399',
  warning: '#F59E0B',       // Amber 500
  danger: '#EF4444',        // Red 500
  purple: '#8B5CF6',        // Violet 500

  // Text
  text: '#F8FAFC',          // Slate 50 (Bright white)
  textSecondary: '#94A3B8', // Slate 400 (Soft blue-gray text)
  textMuted: '#64748B',     // Slate 500 (Muted)

  // Components
  cardBg: '#1E293B',
  overlayBg: 'rgba(15, 23, 42, 0.85)', // Slate 900 with opacity
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};
