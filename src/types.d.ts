import { Node, Properties } from "hast";

type Child = Node | string;

export interface h {
  (type: string, properties?: Properties, ...children: Child[]): Node;
  <Props>(type: (props: Props) => Node, props: Props): Node;
  <Props>(
    type: (props: Props & { children: Child[] }) => Node,
    props: Props,
    ...children: Node[]
  ): Node;

  frag: unique Symbol;
}
