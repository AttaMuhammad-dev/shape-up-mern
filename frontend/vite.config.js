import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],build:{outDir:'build',emptyOutDir:true},server:{proxy:{'/api':'http://localhost:9000'}},test:{globals:true,environment:'jsdom',setupFiles:['./src/testSetup.js'],maxWorkers:2}});
