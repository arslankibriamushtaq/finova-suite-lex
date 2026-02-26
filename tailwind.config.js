/** @type {import('tailwindcss').Config} */
export default {

  content: ["./src/**/*.{js,ts,jsx,tsx}"],
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


