module.exports = {
  get plugin() {
    return require("./config");
  },
  ...require("./jsx"),
};
