// @ts-check

import { toHtml } from "hast-util-to-html";

export const createRenderer =
  (
    /** @type {any} */ instance,
    /** @type {import('./types').PluginOptions['htmlOptions']} */ htmlOptions
  ) =>
  async (/** @type {unknown} */ data) => {
    const hast = await instance.default(data);

    return toHtml(
      {
        type: "root",
        children: Array.isArray(hast) ? hast : [hast],
      },
      { allowDangerousHtml: true, ...htmlOptions }
    );
  };

export const render = (
  /** @type {any} */ hast,
  /** @type {import('./types').PluginOptions['htmlOptions']} */ htmlOptions
) =>
  toHtml(
    {
      type: "root",
      children: Array.isArray(hast) ? hast : [hast],
    },
    { allowDangerousHtml: true, ...htmlOptions }
  );
