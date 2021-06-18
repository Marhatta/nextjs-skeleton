const withCss = require('@zeit/next-css');
const withLess = require('@zeit/next-less');
const lessToJS = require('less-vars-to-js');
const withFonts = require('next-fonts');
const withPlugins = require('next-compose-plugins');

const fileSystem = require('fs');
const path = require('path');

const themeVariables = lessToJS(
  fileSystem.readFileSync(
    path.resolve(__dirname, './styles/variables.less'),
    'utf8'
  )
);

const {
  PHASE_PRODUCTION_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

const nextConfig = {};

const plugins = [
  [
    withLess({
      lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: themeVariables, // make your antd custom effective
      },
      webpack: (config, { isServer }) => {
        if (isServer) {
          const antStyles = /antd\/.*?\/style.*?/;
          const origExternals = [...config.externals];
          config.externals = [
            (context, request, callback) => {
              if (request.match(antStyles)) return callback();
              if (typeof origExternals[0] === 'function') {
                origExternals[0](context, request, callback);
              } else {
                callback();
              }
            },
            ...(typeof origExternals[0] === 'function' ? [] : origExternals),
          ];

          config.module.rules.unshift({
            test: antStyles,
            use: 'null-loader',
          });
        }

        config.module.rules.push({
          test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 100000,
              name: '[name].[ext]',
            },
          },
        });
        return config;
      },
    }),
  ],
  [withCss],
  [withFonts],
];

module.exports = withPlugins(plugins, nextConfig);
