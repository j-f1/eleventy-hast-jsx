import { Node, Properties } from "hast";

type Child = Node | string;

export type Raw = unique symbol;
export type DOCTYPE = unique symbol;
export type Comment = unique symbol;

export interface createElement {
  (type: string, properties?: Properties | null, ...children: Child[]): Node;

  <Props>(type: (props: Props) => Node, props: Props): Node;
  <Props>(
    type: (props: Props & { children: Child[] }) => Node,
    props: Props,
    ...children: Node[]
  ): Node;

  (type: (props: {}) => Node, props: null): Node;
  (
    type: (props: { children: Child[] }) => Node,
    props: null,
    ...children: Node[]
  ): Node;

  (type: createElement["Fragment"], props: null, ...children: Child[]): Node;

  (type: Raw, props: { html: string }): Node;
  (type: DOCTYPE, props: null): Node;
  (type: Comment, props: null, child: string): Node;

  Fragment: unique Symbol;
}
