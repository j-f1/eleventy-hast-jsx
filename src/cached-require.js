// @ts-check
// Source: https://github.com/analog-nico/stealthy-require

"use strict";

/**
 * @param {typeof require.cache} requireCache
 */
function clearCache(requireCache) {
  const prevCache = { ...requireCache };
  for (const resolvedPath of Object.keys(requireCache)) {
    if (!resolvedPath.endsWith(".node")) {
      delete requireCache[resolvedPath];
    }
  }
  return prevCache;
}

/**
 * @template T
 * @param {typeof require.cache} requireCache
 * @param {() => T} callback
 * @param {() => void} callbackForModulesToKeep
 * @param {NodeJS.Module} module
 * @returns T
 */
module.exports = function (
  requireCache,
  callback,
  callbackForModulesToKeep,
  module
) {
  const originalCache = clearCache(requireCache);

  const originalModuleChildren = module.children.slice();
  callbackForModulesToKeep();
  callback();
  const modulesToKeep = Object.keys(clearCache(requireCache));
  // Removes last references to modules required in callbackForModulesToKeep() -> No memory leak
  module.children = originalModuleChildren;

  // Takes the cache entries of the original cache in case the modules where required before
  for (const resolvedPath of modulesToKeep) {
    if (originalCache[resolvedPath]) {
      requireCache[resolvedPath] = originalCache[resolvedPath];
    }
  }

  var freshModule = callback();
  clearCache(requireCache);

  Object.assign(requireCache, originalCache);

  return freshModule;
};
