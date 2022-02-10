import * as HAST from "hast";

type Child = HAST.Node | string | Array<HAST.Node | string>;

export interface createElement {
  (
    type: string,
    properties?: HAST.Properties | null,
    ...children: Child[]
  ): HAST.Element;

  <Props>(type: (props: Props) => HAST.Node, props: Props): HAST.Node;
  <Props>(
    type: (props: Props & { children: Child[] }) => HAST.Node,
    props: Props,
    ...children: HAST.Node[]
  ): HAST.Node;

  (type: (props: {}) => HAST.Node, props: null): HAST.Node;
  (
    type: (props: { children: Child[] }) => HAST.Node,
    props: null,
    ...children: HAST.Node[]
  ): HAST.Node;

  (
    type: createElement["Fragment"],
    props: null,
    ...children: Child[]
  ): HAST.Node;

  Fragment: symbol;
}

export interface PluginOptions {
  babelOptions?: import("@babel/core").TransformOptions & {
    overridePlugins?: true;
  };
  htmlOptions?: import("hast-util-to-html").Options;
  componentsDir?: string;
}

// full spec at https://www.11ty.dev/docs/data-eleventy-supplied/
export interface ShortcodeThis {
  page: { inputPath: string };
  eleventy: { env: { root: string } };
  ctx: { eleventy: { env: { root: string } } };
}
