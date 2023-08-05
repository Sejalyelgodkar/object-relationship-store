import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

const packageJson = require("./package.json");

export default [
  {
    input: "src/lib/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({tsconfig: "./tsconfig.json"}),
      terser()
    ],
  },
  {
    input: "src/lib/index.ts",
    output: [{ file: "build/index.d.ts", format: "es" }],
    plugins: [dts.default()],
  }
];
