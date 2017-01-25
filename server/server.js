const path = require('path');
const _ = require('lodash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const compression = require('compression');
const SearchkitExpress = require('searchkit-express');
const authS3O = require('s3o-middleware');

const { authS3ONoRedirect } = authS3O;

module.exports = {
  start() {
    const env = {
      production: process.env.NODE_ENV === 'production',
    };

    const express = require('express');
    const app = express();

    const searchkitRouter = SearchkitExpress.createRouter({
      host: process.env.BONSAI_URL || 'http://192.168.99.100:9200',
      index: 'tweets',
      queryProcessor(query) {
        console.dir(query);
        return query;
      },
    });

    app.use(compression());
    app.set('view engine', 'ejs');
    app.set('views', `${__dirname}/views`);
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    const port = Number(process.env.PORT || 3000);

    if (!env.production) {
      const webpack = require('webpack');
      const webpackMiddleware = require('webpack-dev-middleware');
      const webpackHotMiddleware = require('webpack-hot-middleware');
      const config = require('../webpack.dev.config.js');
      const compiler = webpack(config);

      app.use(webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        contentBase: 'src',
        stats: {
          colors: true,
          hash: false,
          timings: true,
          chunks: false,
          chunkModules: false,
          modules: false,
        },
      }));

      app.use(webpackHotMiddleware(compiler));
    } else {
      app.use(authS3O);
      app.use('/static', express.static(path.resolve(__dirname, '..', 'dist')));
    }

    app.use('/api', searchkitRouter);
    app.get('*', (req, res) => {
      res.render('index');
    });

    app.listen(port, () => {
      console.log(`Server (${env.production ? 'production' : 'development'}) listening on port ${port}`);
    });
  },
};
