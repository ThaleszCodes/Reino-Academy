import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],build:{sourcemap:false,rolldownOptions:{output:{codeSplitting:{groups:[{name:"react",test:/node_modules\/(react|react-dom|react-router)/},{name:"supabase",test:/node_modules\/@supabase/}]}}}},server:{host:'0.0.0.0'}});
