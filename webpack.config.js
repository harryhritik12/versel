const webpack = require('webpack');

module.exports = function override(config, env) {
  // Adding fallbacks for core Node.js modules
  config.resolve.fallback = {
    fs: false, // fs is not used in the browser, set to false
    stream: require.resolve('stream-browserify'),
    constants: require.resolve('constants-browserify'),
    path: require.resolve('path-browserify'),
    child_process: false, // child_process is not used in the browser, set to false
    zlib: require.resolve('browserify-zlib'),  // Polyfill for zlib
    crypto: require.resolve('crypto-browserify'), // Polyfill for crypto
  };

  // Provide global variables for process and Buffer
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser', // Provide process globally
      Buffer: ['buffer', 'Buffer'], // Provide Buffer globally
    })
  );

  return config;
};
