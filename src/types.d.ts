import * as HAST from "hast";

type Child = HAST.Node | string | Array<HAST.Node | string>;

export interface createElement {
  (
    type: string,
    properties?: HAST.Properties | null,
    ...children: Child[]
  ): HAST.Element;

  <Props, Result>(type: (props: Props) => Result, props: Props): Result;
  <Props, Result>(
    type: (props: Props & { children: Child | Child[] }) => Result,
    props: Props,
    ...children: Child[]
  ): Result;

  <Result>(type: (props: {}) => Result, props: null): Result;
  <Result>(
    type: (props: { children: Child | Child[] }) => Result,
    props: null,
    ...children: Child[]
  ): Result;

  (
    type: createElement["Fragment"],
    props: null,
    ...children: Child[]
  ): HAST.Node[];

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
