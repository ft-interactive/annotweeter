/**
 * Main server file
 * This is really big and monolithic and needs to be refactored a bit. -Æ.
 */
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const compression = require('compression');
const SearchkitExpress = require('searchkit-express');
const { Client } = require('elasticsearch');

module.exports = {
  start() {
    const env = {
      production: process.env.NODE_ENV === 'production',
    };

    const express = require('express');
    const app = express();

    const searchkitRouter = SearchkitExpress.createRouter({
      host: process.env.BONSAI_URL || 'http://192.168.99.100:9200',
      index: 'tweets/tweet',
      queryProcessor(query) {
        console.dir(query);
        return query;
      },
    });

    const es = new Client({
      host: process.env.BONSAI_URL || 'http://192.168.99.100:9200',
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
      app.use(require('s3o-middleware')); // Require Google FT.com login for all paths
      app.use('/static', express.static(path.resolve(__dirname, '..', 'dist')));
    }

    app.use('/api', searchkitRouter);

    /**
     * Make a query for parent tweet with a particular tweetID
     * Returns an array of annotation objects.
     *
     * @TODO turn into a recursive function so it can retry request
     *
     * @param  {string|number} tweetId Twitter tweet ID
     * @return {Promise<Array<Annotation>>}
     */
    const getAnnotations = tweetId => es.search({
      index: 'tweets',
      type: 'annotation',
      body: {
        query: {
          has_parent: {
            parent_type: 'tweet',
            query: {
              term: {
                id_str: tweetId,
              },
            },
          },
        },
      },
    });

    /**
     * GET method (annotations)
     * Retrieve all the annotations for a particular tweet ID
     */
    app.get('/api/annotations/:tweetId', (req, res) => {
      getAnnotations(req.params.tweetId)
      .then(response => res.json(response.hits.hits))
      .catch((err) => {
        if (err.status === 400) {
          res.status(400).json([]);
        } else if (err.status === 429) { // Retry once after waiting 1s. @TODO improve
          setTimeout(() => {
            getAnnotations(req.params.tweetId)
            .then(response => res.json(response.hits.hits))
            .catch(res.status(429).json([]));
          }, 2000);
        } else {
          res.status(500).json({ message: 'Server Error' });
        }
      });
    });

    /**
     * POST method (annotations)
     * Insert a new annotation into ES
     *
     * Responds with empty array and status 201 on success.
     */
    app.post('/api/annotations', (req, res) => {
      es.search({
        index: 'tweets',
        type: 'tweet',
        q: `id_str:${req.body.parentId}`,
      })
      .then((items) => {
        const first = items.hits.hits.shift(); // Get ID of first result.
        es.index({
          index: 'tweets',
          type: 'annotation',
          parent: first._id,
          body: {
            '@timestamp': Date.now(),
            text: req.body.text,
            author: res.locals.s3o_username,
          },
        })
        .then((result) => {
          console.dir(result);
          res.status(201).json([]);
        })
        .catch((err) => {
          res.sendStatus(500);
          console.error(err);
        });
      })
      .catch((err) => {
        console.error(err);
        if (err.status === 400) {
          res.status(404).json({ message: 'Tweet not found.' });
        }
      });
    });

    /**
     * PUT method (annotations)
     * Update an annotation given its parent tweet ID
     */
    app.put('/api/annotations/:id', (req, res) => {
      es.search({
        index: 'tweets',
        type: 'tweet',
        q: `id_str:${req.body.parentId}`,
      })
      .then((items) => {
        const first = items.hits.hits.shift(); // Get ID of first result.
        es.index({
          index: 'tweets',
          type: 'annotation',
          id: req.params.id,
          parent: first._id,
          body: {
            '@timestamp': Date.now(),
            text: req.body.text,
          },
        })
        .then(() => res.status(200).json([]))
        .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
    });

    app.delete('/api/annotation/:id/:parent', (req, res) => {
      console.log(`Deleting annotation ${req.params.id}`);
      es.delete({
        index: 'tweets',
        type: 'annotation',
        routing: req.params.parent,
        id: req.params.id,
      })
      .then(() => res.status(204))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: `Problem deleting ${req.params.id}` });
      });
    });

    app.get('*', (req, res) => {
      res.render('index');
    });

    app.listen(port, () => {
      console.log(`Server (${env.production ? 'production' : 'development'}) listening on port ${port}`);
    });
  },
};
