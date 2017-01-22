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
      host: process.env.BONSAI_URL || 'http://localhost:9200',
      index: 'tweets',
      queryProcessor(query, req, res) {
        console.log(query);
        return query;
      },
    });

    app.use('/api', authS3ONoRedirect, searchkitRouter);
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


      app.get('*', (req, res) => {
        res.render('index');
      });
    } else {
      app.get('*', authS3O, (req, res) => {
        res.render('index');
      });
      app.use('/static', express.static(`${__dirname}/dist`));
    }

    app.listen(port, () => {
      console.log(`Server listening on port ${port}, go refresh and see magic`);
    });
  },
};
