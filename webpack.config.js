const path = require('path');
        const { VueLoaderPlugin } = require('vue-loader')

        module.exports = {
          mode: 'development',
          entry: {
          Video: path.resolve(__dirname, 'src/slide/Module.ts'),
          VideoOptions: path.resolve(__dirname, 'src/VideoOptions.vue'),
  },
          output: {
            path: path.resolve(__dirname, './dist'),
            publicPath: '/dist/',
            filename: '[name].js',
            library: ['dynamicscreen.video::0.0.2'],
            libraryTarget: 'window',
          },
          module: {
            rules: [
              {
                test: /\.vue$/,
                loader: 'vue-loader'
              },
              {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                  appendTsSuffixTo: [/\.vue$/],
                }
              },
              {
                test: /\.css$/,
                use: [
                  'style-loader',
                  'css-loader'
                ]
              }
            ]
          },
          resolve: {
            extensions: ['.ts', '.js', '.vue', '.json'],
            alias: {
              'vue': '@vue/runtime-dom',
              '@': 'src',
            }
          },
          plugins: [
            new VueLoaderPlugin()
          ],
          externals: {
          },
        }
