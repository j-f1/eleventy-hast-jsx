import { Node, Properties } from "hast";

type Child = Node | string;

export type Raw = (props: { html: string }) => Node;
export type DOCTYPE = () => Node;
export type Comment = (props: { children: string }) => Node;

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

  Fragment: symbol;
}
