import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [
            react(),
            {
                name: 'manifest-transform',
                writeBundle() {
                    const manifestPath = resolve(__dirname, 'dist/manifest.json');
                    if (fs.existsSync(manifestPath)) {
                        let manifest = fs.readFileSync(manifestPath, 'utf-8');

                        // Handle App URL replacement
                        manifest = manifest.replace(/__VITE_APP_URL__/g, env.VITE_APP_URL || '');

                        // Handle API Permission replacement
                        // If VITE_API_URL is "https://example.com/api", we want "https://example.com/*"
                        let apiPerm = '*://*/*'; // Default fallback
                        try {
                            if (env.VITE_API_URL) {
                                const url = new URL(env.VITE_API_URL);
                                apiPerm = `${url.protocol}//${url.host}/*`;
                            }
                        } catch (e) {
                            console.warn('Could not parse VITE_API_URL for manifest permissions');
                        }
                        manifest = manifest.replace(/__VITE_API_PERM__/g, apiPerm);

                        fs.writeFileSync(manifestPath, manifest);
                    }
                }
            }
        ],
        build: {
            outDir: 'dist',
            rollupOptions: {
                input: {
                    content: resolve(__dirname, 'src/content.tsx'),
                },
                output: {
                    // No hashes in filenames — Chrome extensions need predictable paths
                    entryFileNames: 'assets/[name].js',
                    chunkFileNames: 'assets/[name].js',
                    assetFileNames: 'assets/[name].[ext]',
                },
            },
            // Inline all CSS to avoid CSP issues with external stylesheets
            cssCodeSplit: false,
        },
    };
});
