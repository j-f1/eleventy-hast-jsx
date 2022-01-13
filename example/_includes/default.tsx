import { createElement, DOCTYPE, Raw } from "../..";
import { inspect } from "util";

export default ({ title = "Untitled", content }) => (
  <>
    <DOCTYPE />
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body>
        <h1>{title}</h1>
        <Raw html={content} />
      </body>
    </html>
  </>
);
