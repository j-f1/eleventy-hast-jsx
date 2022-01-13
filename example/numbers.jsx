import { createElement } from "..";

export const data = {
  layout: "default.tsx",
};

export default ({ numbers }) => (
  <ul>
    {numbers.map((n) => (
      <>
        <li>{n}</li>
        <li>{n}</li>
      </>
    ))}
  </ul>
);
