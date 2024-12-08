import { magicPreset } from '@magiclabs/ui-components/presets';
import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset
  preflight: true,
  // Minify the generated css
  minify: true,
  // Hash all classnames
  hash: true,
  // Clean the output directory before generating the css
  clean: true,

  importMap: '@styled',

  // Where to look for your css declarations
  include: [
    './node_modules/@magiclabs/ui-components/dist/panda.buildinfo.json',
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
  ],

  // Files to exclude
  exclude: [],

  // Styling conditions / modes
  conditions: {
    light: '[data-color-mode=light] &',
    dark: '[data-color-mode=dark] &',
  },

  presets: ['@pandacss/dev/presets', magicPreset],

  // Useful for theme customization
  theme: {
    extend: {
      keyframes: {
        slideInX: {
          '0%': { transform: 'translateX(calc(100% + 48px))' },
          '100%': { transform: 'translateX(0%)' },
        },
        slideOutX: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(calc(100% + 48px))' },
        },
        accordionDown: {
          '0%': { height: 0 },
          '100%': { height: 'var(--radix-accordion-content-height)' },
        },
        accordionUp: {
          '0%': { height: 'var(--radix-accordion-content-height)' },
          '100%': { height: 0 },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',

  // Output extension impacting build - needed for jest
  outExtension: 'js',

  // The JSX framework to use
  jsxFramework: 'react',

  // Pre-generate some color styles
  staticCss: {
    css: [
      {
        properties: {
          color: ['text.primary', 'text.secondary', 'text.tertiary', 'text.quaternary'],
        },
      },
    ],
  },

  globalCss: {
    body: {
      bg: 'surface.secondary',
    },
  },

  // The output directory for your css system
});
