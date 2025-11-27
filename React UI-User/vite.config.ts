
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  // Plugin to handle imports from admin_panel files
  // This ensures all package imports from admin_panel resolve correctly
  function adminPanelResolver() {
    return {
      name: 'admin-panel-resolver',
      // Intercept import resolution for admin_panel files
      resolveId(id: string, importer?: string) {
        // Only handle imports from admin_panel files
        if (!importer || (!importer.includes('admin_panel') && !importer.includes('admin-panel'))) {
          return null;
        }

        // Skip relative imports (./ or ../) - let Vite handle these normally
        if (id.startsWith('.') || id.startsWith('/') || path.isAbsolute(id)) {
          return null;
        }

        // Remove version numbers from package imports
        const cleanedId = id.replace(/^(@radix-ui\/[^@]+)@[\d.]+$/, '$1')
                           .replace(/^([^@\/]+)@[\d.]+$/, '$1');

        // If we cleaned the ID, return it so Vite resolves the cleaned version
        if (cleanedId !== id) {
          return cleanedId;
        }

        // For non-versioned imports, let Vite handle resolution normally
        return null;
      },
      // Transform source code to remove version numbers (backup)
      transform(code: string, id: string) {
        // Only transform files from admin_panel
        if (id.includes('admin_panel') || id.includes('admin-panel')) {
          // Remove version numbers from @radix-ui imports
          code = code.replace(
            /from\s+['"]@radix-ui\/([^'"]+)@[\d.]+['"]/g,
            (match, pkg) => `from '@radix-ui/${pkg}'`
          );
          // Remove version numbers from other package imports
          code = code.replace(
            /from\s+['"]([^'"]+)@[\d.]+['"]/g,
            (match, pkg) => {
              // Don't transform relative imports
              if (pkg.startsWith('.') || pkg.startsWith('/')) {
                return match;
              }
              return `from '${pkg}'`;
            }
          );
        }
        return { code, map: null };
      },
    };
  }

  export default defineConfig({
    root: __dirname, // Explicitly set root to React UI-User directory
    plugins: [react(), adminPanelResolver()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      // Ensure node_modules are resolved from this project root, not admin_panel
      preserveSymlinks: false,
      // Force resolution from project root
      mainFields: ['module', 'jsnext:main', 'jsnext', 'browser', 'main'],
      dedupe: [
        'react',
        'react-dom',
        'recharts',
        'class-variance-authority',
        'next-themes',
        'sonner',
        'lucide-react',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs',
        '@radix-ui/react-switch',
        '@radix-ui/react-slot',
        '@radix-ui/react-slider',
        '@radix-ui/react-separator',
        '@radix-ui/react-select',
        '@radix-ui/react-radio-group',
        '@radix-ui/react-progress',
        '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar',
        '@radix-ui/react-label',
        '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion',
      ],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/1df38bb3e2aa90271d87fe3d531275500d1f2a94.png': path.resolve(__dirname, './src/assets/1df38bb3e2aa90271d87fe3d531275500d1f2a94.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
        '@admin-panel': path.resolve(__dirname, '../admin_panel/src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
    optimizeDeps: {
      // Pre-bundle dependencies to ensure they're resolved correctly
      include: [
        'recharts',
        'class-variance-authority',
        'next-themes',
        'sonner',
        'lucide-react',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs',
        '@radix-ui/react-switch',
        '@radix-ui/react-slot',
        '@radix-ui/react-slider',
        '@radix-ui/react-separator',
        '@radix-ui/react-select',
        '@radix-ui/react-radio-group',
        '@radix-ui/react-progress',
        '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar',
        '@radix-ui/react-label',
        '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion',
      ],
    },
  });