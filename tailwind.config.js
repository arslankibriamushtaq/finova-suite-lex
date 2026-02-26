/** @type {import('tailwindcss').Config} */
export default {

  content: [
    "./src/pages/InvestorPages/**/*.{js,ts,jsx,tsx}",
    "./src/components/ProductManagement/**/*.{js,ts,jsx,tsx}",
    "./src/components/ui/**/*.{js,ts,jsx,tsx}",
    "./src/components/language-switcher.tsx",
    "./src/components/add-product-wizard.tsx",
    "./src/components/product-category-wizard.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
      },
    },
  },
  corePlugins: {
    preflight: false, // Disable Tailwind's base reset to avoid Bootstrap conflicts
  },
}


