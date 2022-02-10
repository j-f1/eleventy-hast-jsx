// @ts-check

module.exports = {
  get plugin() {
    return require("./plugin");
  },
  ...require("./jsx"),
};
