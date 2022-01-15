const { createElement, DOCTYPE, Raw } = require("../..");

exports.default = ({ title = "Untitled", content }) => (
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
