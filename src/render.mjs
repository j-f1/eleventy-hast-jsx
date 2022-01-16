import { toHtml } from "hast-util-to-html";

export const createRenderer =
  (instance, htmlOptions) => async (/** @type {unknown} */ data) => {
    const hast = await instance.default(data);

    return toHtml(
      {
        type: "root",
        children: Array.isArray(hast) ? hast : [hast],
      },
      { allowDangerousHtml: true, ...htmlOptions }
    );
  };
