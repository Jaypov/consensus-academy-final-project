require("ts-node/register");

module.exports = {
  test_file_extension_regexp: /.*\.ts$/,
    networks: {
      development: {
        host: "0.0.0.0",
        port: 8545,
        network_id: 1337,
      },
      test: {
        network_id: '*',
      }
    },
    compilers: {
    solc: {
      version: "^0.6.0",
    },
  },
};
