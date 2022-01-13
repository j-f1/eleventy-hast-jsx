import { createElement, DOCTYPE } from "../..";
import { inspect } from "util";

export default (data) => (
  <>
    <DOCTYPE />
    <html>
      <head>
        <title>Hello, world!</title>
      </head>
      <body>
        <h1>Test</h1>
        <pre>{inspect(data)}</pre>
      </body>
    </html>
  </>
);
