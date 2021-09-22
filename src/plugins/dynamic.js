export default (ctx, inject) => {
  // make lazy component loaders available for hydratableLoader
  // lets set all component options of components which were detected by nuxt/components including its loaders as prop of each component
  
  // now we are going to inject all the dynamic webpack imports to each component as single property with its own chunk
  const loaders = {
    <%=options.components.map(c => {
      const exp = c.export === 'default' ? `c.default || c` : `c['${c.export}']`
      return `  ${c.pascalName}: () => import('${relativeToBuild(c.filePath)}' /* webpackChunkName: "${c.chunkName.replace(/^.*?:/, '')}" */).then(c => ${exp})`
    }).join(',\n    ') %>
  }

  const prefixes = <%=JSON.stringify(options.prefixes || []) %>
  const debug = <%=JSON.stringify(options.debug || []) %>

  inject("nuxtDynamic", { loaders, prefixes, debug });
};
