const { createElement, DOCTYPE, Raw } = require("../..");
const Heading = require("../components/Heading");

exports.default = ({ title = "Untitled", content }) => (
  <>
    <DOCTYPE />
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body>
        <Heading title={title} />
        <Raw html={content} />
      </body>
    </html>
  </>
);
