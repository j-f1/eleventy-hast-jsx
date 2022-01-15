import * as HAST from "hast";
import { Raw as RawNode } from "hast-util-to-html/lib/types";

type Child = HAST.Node | string | Array<HAST.Node | string>;

export type Raw = (props: { html: string }) => RawNode;
export type DOCTYPE = () => HAST.DocType;
export type Comment = (props: { children: string }) => HAST.Comment;

export interface createElement {
  (
    type: string,
    properties?: HAST.Properties | null,
    ...children: Child[]
  ): HAST.Node;

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
