import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

const watch = Deno.args[0] === "watch";

const result = await esbuild.context({
    plugins: [...denoPlugins()],
    entryPoints: ["src/main.ts"],
    outfile: "./dist/bundle.js",
    format: "esm",
    bundle: true,
    logLevel: "info"
});

if (watch) {
    await result.watch();
} else {
    await esbuild.stop();
}


