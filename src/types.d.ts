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
