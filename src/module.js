import { resolve } from "path";
import consola from "consola";

export default async function dynamicModule({ withConsole = false, prefix = "nuxt", debug = false }) {
  const { nuxt } = this
  const prefixes = [];
  const logger = consola.withScope("@nujek/dynamic");

  const runtimeDir = resolve(__dirname, 'runtime')
  nuxt.options.build.transpile.push(runtimeDir, '@nujek/dynamic')

  this.nuxt.hook("components:dirs", (dirs) => {
    dirs.push({
      path: resolve(runtimeDir, "components"),
      prefix,
      pathPrefix: false
    });

    // grab all possible prefixes
    prefixes.push(
      ...Array.from(new Set(dirs.map((d) => d.prefix).filter((p) => p)))
    );
  });

  this.nuxt.hook("components:extend", (components) => {
    // there is a default import and a lazy (async) import for each component (nuxt/components v1)
    // all components are global and there is a asyncImport for each component  (nuxt/components v2)
    // add plugin to inject the array of async components
    const asyncPriorV2 = (c) => !c.global && c.async;
    const asyncV2Onwards = (c) => c.asyncImport;
    const asyncComponents = components
      .filter((c) => asyncPriorV2(c) || asyncV2Onwards(c))
      .map((c) => ({
        ...c,
        pascalName: c.pascalName.startsWith("Lazy")
          ? c.pascalName
          : `Lazy${c.pascalName}`,
      }));

    this.addPlugin({
      src: resolve(runtimeDir, "plugins/dynamic.js"),
      options: { components: asyncComponents, prefixes, debug },
    });

    if (withConsole) {
      logger.success({
        message: "auto import for dynamic components ready",
        additional: `Module @blokwise/dynamic successfully registered.\nReady to auto import ${asyncComponents.length
          } items as dynamic components lazily (with prefixes: ${prefixes
            .map((prefix) => `'${prefix}'`)
            .join(", ")}).\nRead docs: https://dynamic.blokwise.io`,
        badge: true,
      });
    }
  });

  return true;
}

module.exports.meta = require("./../package.json");
