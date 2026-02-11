import type { Config } from 'tailwindcss';
import PrimeUI from 'tailwindcss-primeui';

export default {
  content: [],
  theme: {
    extend: {},
  },

  // 添加plugins、darkMode配置项
  plugins: [PrimeUI],
  darkMode: ["class", ".p-dark"]
} satisfies Config