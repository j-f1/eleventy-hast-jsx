import { Node, Properties } from "hast";

type Child = Node | string;

export interface createElement {
  (type: string, properties?: Properties, ...children: Child[]): Node;
  <Props>(type: (props: Props) => Node, props: Props): Node;
  <Props>(
    type: (props: Props & { children: Child[] }) => Node,
    props: Props,
    ...children: Node[]
  ): Node;

  Fragment: unique Symbol;
}
