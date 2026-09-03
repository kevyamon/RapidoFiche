/**
 * THEME CENTRALISE RAPIDOFICHE
 * Regle absolue : Aucune couleur ne doit etre codee en dur dans les composants.
 * Toutes les teintes et styles visuels proviennent exclusivement de ce fichier.
 */

export const theme = {
  colors: {
    // Teintes Principales (Bleu Institutionnel EdTech)
    primary: {
      50: '#F0F7FF',
      100: '#E0EFFF',
      200: '#B9DDFF',
      300: '#7CC2FF',
      400: '#38A2FF',
      500: '#0C83EB',
      600: '#0066C7',
      700: '#0051A1',
      800: '#044585',
      900: '#0A3B6F',
      DEFAULT: '#0066C7',
    },

    // Teintes Secondaires (Ambre Pédagogique Calme)
    secondary: {
      50: '#FFFDF5',
      100: '#FFFBEB',
      200: '#FEF3C7',
      300: '#FDE68A',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      DEFAULT: '#D97706',
    },

    // Arrière-plans & Surfaces
    background: {
      main: '#F8FAFC',
      card: '#FFFFFF',
      surface: '#F1F5F9',
      input: '#FFFFFF',
      hover: '#F8FAFC',
      active: '#EFF6FF',
    },

    // Typographie & Textes
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      muted: '#64748B',
      disabled: '#94A3B8',
      inverse: '#FFFFFF',
      link: '#0066C7',
    },

    // Bordures & Séparateurs
    border: {
      subtle: '#F1F5F9',
      default: '#E2E8F0',
      strong: '#CBD5E1',
      focus: '#0066C7',
    },

    // Statuts Métier
    status: {
      success: {
        bg: '#ECFDF5',
        text: '#065F46',
        border: '#A7F3D0',
        badge: '#10B981',
      },
      warning: {
        bg: '#FFFBEB',
        text: '#92400E',
        border: '#FDE68A',
        badge: '#F59E0B',
      },
      danger: {
        bg: '#FEF2F2',
        text: '#991B1B',
        border: '#FECACA',
        badge: '#EF4444',
      },
      info: {
        bg: '#EFF6FF',
        text: '#1E40AF',
        border: '#BFDBFE',
        badge: '#3B82F6',
      },
      offline: {
        bg: '#F8FAFC',
        text: '#334155',
        border: '#CBD5E1',
        badge: '#64748B',
      },
    },

    // Statuts d'Abonnement
    subscription: {
      activeBg: '#ECFDF5',
      activeText: '#065F46',
      activeBorder: '#A7F3D0',
      expiredBg: '#FEF2F2',
      expiredText: '#991B1B',
      expiredBorder: '#FECACA',
      pendingBg: '#FFFBEB',
      pendingText: '#92400E',
      pendingBorder: '#FDE68A',
    },
  },

  // Rayons de bordure arrondis professionnels
  radius: {
    xs: '0.25rem', // 4px
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px',
  },

  // Ombres discrètes et soignées
  shadows: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },

  // Typographie standard
  fonts: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};
