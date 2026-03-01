import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ✅ Plugin personnalisé pour résoudre utils/supabase/info
function resolveSupabaseInfo() {
  return {
    name: 'resolve-supabase-info',
    resolveId(source: string) {
      // Résoudre tous les imports de utils/supabase/info (avec ou sans ../)
      if (source.includes('utils/supabase/info') && !source.endsWith('.tsx')) {
        return path.resolve(__dirname, './utils/supabase/info.tsx');
      }
      
      // ✅ FIX: Ignorer complètement les imports de fichiers backend
      const backendFiles = [
        'kv_store.tsx',
        'kv_store.ts',
        'firebase-admin.ts',
        'firebase-admin.tsx',
        'fcm-routes.ts',
        'admin_users_routes.ts',
        'kv-wrapper.ts',
        'phone-utils.ts',
        'uuid-validator.ts',
        'email-validation.ts',
      ];
      
      for (const backendFile of backendFiles) {
        if (source.includes(backendFile) || source.endsWith(backendFile)) {
          console.warn(`⚠️ Ignoré import backend: ${source}`);
          return { id: source, external: true };
        }
      }
      
      // Ignorer tous les imports du dossier supabase/functions/server/
      if (source.includes('supabase/functions/server/')) {
        console.warn(`⚠️ Ignoré import backend: ${source}`);
        return { id: source, external: true };
      }
      
      return null;
    }
  };
}

// Configuration pour FIGMA MAKE (utilise esm.sh CDN)
export default defineConfig({
  plugins: [
    react({
      exclude: [
        /supabase\/functions\/server/,
        /supabase\/functions/,
        /\.md$/,
      ],
    }),
    resolveSupabaseInfo(), // ✅ NOUVEAU: Plugin pour résoudre utils/supabase/info
  ],
  
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'], // ✅ NOUVEAU: Résolution automatique des extensions
    alias: {
      // Alias pour Motion - Redirige vers notre implémentation locale
      'motion/react': path.resolve(__dirname, './lib/motion.tsx'),
      
      // Alias pour sonner - Utilise notre implémentation locale
      'sonner': path.resolve(__dirname, './lib/sonner.ts'),
      
      // Alias pour class-variance-authority
      'class-variance-authority': path.resolve(__dirname, './lib/class-variance-authority.ts'),
      
      // ✅ NOUVEAU: Alias pour lucide-react - Redirige vers nos icônes locales
      'lucide-react': path.resolve(__dirname, './lib/icons.tsx'),
      
      // ✅ FIX CRITIQUE: Alias pour utils/supabase/info (avec ET sans extension)
      '../utils/supabase/info': path.resolve(__dirname, './utils/supabase/info.tsx'),
      '../../utils/supabase/info': path.resolve(__dirname, './utils/supabase/info.tsx'),
      
      // ✅ FIX: Alias pour utils - permet d'importer sans extension
      '@': path.resolve(__dirname, './'),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      external: [
        'react-day-picker', // ✅ Externaliser react-day-picker pour éviter l'erreur path.resolve
        'framer-motion', // ✅ Externaliser framer-motion - n'est plus utilisé
        'npm:hono', // ✅ Exclure les imports Deno backend
        /^npm:/, // ✅ Exclure tous les imports npm: (syntaxe Deno)
        /^supabase\\/functions\\/server\\//, // ✅ Exclure tous les fichiers du serveur backend
        /kv_store\.(tsx|ts)$/, // ✅ FIX: Exclure kv_store.tsx/ts
        /firebase-admin\.(tsx|ts)$/, // ✅ FIX: Exclure firebase-admin.tsx/ts
        /fcm-routes\.(tsx|ts)$/, // ✅ FIX: Exclure fcm-routes.tsx/ts
        /admin_users_routes\.(tsx|ts)$/, // ✅ FIX: Exclure admin_users_routes.tsx/ts
        /kv-wrapper\.(tsx|ts)$/, // ✅ FIX: Exclure kv-wrapper.tsx/ts
        /phone-utils\.(tsx|ts)$/, // ✅ FIX: Exclure phone-utils.tsx/ts
        /uuid-validator\.(tsx|ts)$/, // ✅ FIX: Exclure uuid-validator.tsx/ts
        /email-validation\.(tsx|ts)$/, // ✅ FIX: Exclure email-validation.tsx/ts
      ],
    },
  },
  
  esbuild: {
    loader: 'tsx',
    include: /\.(tsx?|jsx?)$/,
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'leaflet',
      'react-leaflet',
      'react-day-picker', // ✅ AJOUTÉ - Pre-bundle react-day-picker
      'date-fns', // ✅ AJOUTÉ - Pre-bundle date-fns avec react-day-picker
      'date-fns/format',
      'date-fns/locale',
    ],
    exclude: [
      'lucide-react', // ✅ NOUVEAU: Exclure lucide-react - utilise notre implémentation locale
      'sonner', // Utilise notre implémentation locale dans /lib/sonner.ts
      'class-variance-authority', // Utilise notre implémentation locale
      'framer-motion', // ✅ N'est plus utilisé
      'firebase/app', // ✅ Exclure Firebase - chargé dynamiquement via esm.sh
      'firebase/messaging',
      'firebase/analytics',
    ]
  },
  
  server: {
    fs: {
      strict: false
    }
  }
});
