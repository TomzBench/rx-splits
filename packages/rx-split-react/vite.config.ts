import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "RxSplits",
      fileName: "rx-split",
    },
    rollupOptions: {
      external: ["react", "rxjs"],
      output: {
        globals: {
          react: "React",
          rxjs: "Rxjs",
        },
      },
    },
  },
  plugins: [react(), dts()],
});
