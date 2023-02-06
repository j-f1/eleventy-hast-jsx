const { DOCTYPE, Raw } = require("../..");
const { default: Heading } = require("../_components/Heading");

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
