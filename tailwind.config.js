function withOpacity(variableName) {
  return function ({ opacityValue }) {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: [
    './layout/*.liquid',
    './templates/**/*.liquid',
    './sections/*.liquid',
    './snippets/*.liquid',
    './assets/**/product-switcher.js'
  ],
  prefix: 'tw-',
  theme: {
    extend: {
      fontFamily: {
        body: 'var(--font-body-family)',
        heading: 'var(--font-heading-family)'
      },
      colors: {
        text: withOpacity('--color-foreground'),
        background: withOpacity('--color-background'),
        button: withOpacity('--color-button'),
        'button-text': withOpacity('--color-button-text'),
        'secondary-button': withOpacity('--color-secondary-button'),
        'secondary-button-text': withOpacity('--color-secondary-button-text'),
        link: withOpacity('--color-link'),
        shadow: withOpacity('--color-shadow')
      },
      screens: {
        md: '750px',
        lg: '990px',
        xl: '1600px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-base-font-size'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
};
