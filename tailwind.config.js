function withOpacity(variableName) {
  return function ({ opacityValue }) {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: ['./layout/*.liquid', './templates/**/*.liquid', './sections/*.liquid', './snippets/*.liquid'],
  prefix: 'tw-',
  theme: {
    extend: {
      fontFamily: {
        body: 'var(--font-body-family)',
        heading: 'var(--font-heading-family)'
      },
      colors: {
        text: 'rgba(var(--color-base-text), <alpha-value>)',
        accent1: 'rgba(var(--color-base-accent-1), <alpha-value>)',
        accent2: 'rgba(var(--color-base-accent-2), <alpha-value>)',
        background1: 'rgba(var(--color-base-background-1), <alpha-value>)',
        background2: 'rgba(var(--color-base-background-2), <alpha-value>)'
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
