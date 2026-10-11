import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "node:path";

const cesiumBuild = "node_modules/cesium/Build/Cesium";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: `${cesiumBuild}/Assets`, dest: "cesiumStatic" },
        { src: `${cesiumBuild}/ThirdParty`, dest: "cesiumStatic" },
        { src: `${cesiumBuild}/Widgets`, dest: "cesiumStatic" },
        { src: `${cesiumBuild}/Workers`, dest: "cesiumStatic" },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: resolve(import.meta.dirname, "App/RawPly3DGSDemo.html"),
    },
  },
});
