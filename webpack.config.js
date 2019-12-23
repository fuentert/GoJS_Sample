module.exports = {
  // module: {
  //   rules: [
  //     {
  //       test: /\.css$/,
  //       use: [
  //         // style-loader
  //         { loader: 'style-loader' },
  //         // css-loader
  //         {
  //           loader: 'css-loader',
  //           options: {
  //             modules: true
  //           }
  //         },
  //       ]
  //     }
  //   ]
  // }
  module: {
              rules: [
                  {
                      test: /\.ts$/,
                      use: [
                          {
                              loader: '@ngtools/webpack',
                              options: {
                                  tsConfigPath: path.join(__dirname, 'tsconfig.json')
                              }
                          }
                      ]
                  },
                  {
                      test: /\.js$/,
                      use: [
                          {
                              loader: 'ng-annotate-loader',
                              options: {
                                  ngAnnotate: 'ng-annotate-patched',
                                  es6: true,
                                  explicitOnly: false
                              }
                          }
                      ],
                      exclude: /node_modules/
                  },
                  {
                      test: /\.html$/,
                      use: ['html-loader']
                  },
                  {
                      test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg|png|gif)(\?.*$|$)/,
                      use: [
                          {
                              loader: 'url-loader',  // inline static files less than 10KB as DataUrls
                              options: {
                                  limit: 10000
                              }
                          }
                      ]
                  },
                  {
                      test: /.conf$/,
                      use: 'file-loader?name=[name].[ext]'
                  }
              ]
          }
};
