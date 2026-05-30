import type { ThemeConfig } from 'antd';

/** RetailMesh brand blue */
export const BRAND_BLUE = '#33a1ff';
const BRAND_BLUE_HOVER = '#5cb3ff';
const BRAND_BLUE_ACTIVE = '#1a8fe6';
const BRAND_BLUE_RGB = '51, 161, 255';

/**
 * Ant Design v5 Theme Configuration
 *
 * Maps existing CSS variables to Ant Design design tokens
 * for consistent theming across the application.
 *
 * This theme configuration matches the host app theme.
 */
export const themeConfig: ThemeConfig = {
  token: {
    // Brand Colors - Primary
    colorPrimary: BRAND_BLUE,
    colorPrimaryHover: BRAND_BLUE_HOVER,
    colorPrimaryActive: BRAND_BLUE_ACTIVE,

    // Content Colors
    colorText: '#1e293b',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748b',
    colorTextQuaternary: '#94a3b8',

    // Background Colors
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f8fafc',
    colorBgLayout: '#f1f5f9',
    colorBgSpotlight: '#f5f5f5',

    // Border Colors
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',

    // Status Colors
    colorError: '#ef4444',
    colorWarning: '#f59e0b',
    colorSuccess: '#52c41a',
    colorInfo: BRAND_BLUE,

    // Typography
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    // Border Radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,

    // Spacing
    sizeUnit: 4,
    sizeStep: 4,

    // Shadows
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    boxShadowSecondary: `0 4px 16px rgba(${BRAND_BLUE_RGB}, 0.25)`,

    // Line Height
    lineHeight: 1.5,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.3,
    lineHeightHeading3: 1.4,

    // Control Height
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 600,
      controlHeight: 40,
      controlHeightLG: 48,
      primaryShadow: `0 2px 8px rgba(${BRAND_BLUE_RGB}, 0.3)`,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Card: {
      borderRadius: 12,
      paddingLG: 24,
    },
    Typography: {
      fontFamily: "'Poppins', sans-serif",
    },
    Layout: {
      bodyBg: '#ffffff',
      headerBg: '#ffffff',
      footerBg: '#1e293b',
    },
  },
};

/**
 * Gradient colors for brand primary (used in inline styles)
 */
export const brandGradient = {
  start: BRAND_BLUE,
  end: BRAND_BLUE_ACTIVE,
  hoverStart: BRAND_BLUE_HOVER,
  hoverEnd: '#1484d9',
};
