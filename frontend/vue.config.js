module.exports = {
  transpileDependencies: true,
  devServer: {
    port: 34568,
    allowedHosts: [
      '.rioslab.org',
      '.malloc.fun'
    ],
    webSocketServer: false,
  },
  configureWebpack: {
    resolve: {
      alias: {
        'fs': false
      }
    }
  }
}
