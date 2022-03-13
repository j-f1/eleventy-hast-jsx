exports.data = {
  layout: "default.jsx",
};

exports.default = ({ numbers }) => (
  <ul>
    {numbers.map((n) => (
      <>
        <li>{n}</li>
        <li>{n}</li>
      </>
    ))}
  </ul>
);
