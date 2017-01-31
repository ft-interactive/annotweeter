const { Client } = require('elasticsearch');
const axios = require('axios');

const es = Client({
  host: process.env.ES_HOST || 'localhost:9200',
});

const mappings = {
  tweet: {
    properties: {
      '@timestamp': {
        type: 'date',
      },
      '@version': {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
      '@imported-from': {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            null_value: 'Twitter API',
          },
        },
      },
      client: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
      hashtags: {
        properties: {
          indices: {
            type: 'long',
          },
          text: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
        },
      },
      'in-reply-to': {
        type: 'long',
      },
      message: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
      retweeted: {
        type: 'boolean',
      },
      source: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
      symbols: {
        properties: {
          indices: {
            type: 'long',
          },
          text: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
        },
      },
      urls: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
      user: {
        type: 'text',
        fields: {
          keyword: {
            type: 'keyword',
            ignore_above: 256,
          },
        },
      },
      user_mentions: {
        properties: {
          id: {
            type: 'long',
          },
          id_str: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          indices: {
            type: 'long',
          },
          name: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          screen_name: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
        },
      },
    },
  },
};

async function getAllTrumpTweets(rangeStart = 2009, rangeEnd = 2017) {
  const years = Array(rangeEnd)
    .fill(1)
    .map((v, i) => i + 1).filter(v => v >= rangeStart && v <= rangeEnd);
  const data = await Promise.all(years.map(async year =>
    (await axios.get(`http://trumptwitterarchive.com/data/realdonaldtrump/${year}.json`)).data));

  return data.reduce((col, cur) => col.concat(cur));
}

getAllTrumpTweets()
.then(async (data) => {
  try {
    await es.indices.get({ index: 'tweets' });
  } catch (e) {
    console.error(e);
    console.log('Creating index afresh');
    try {
      await es.indices.create({
        index: 'tweets',
        body: {
          mappings,
        },
      });
    } catch (ee) {
      console.error(ee);
    }
  }

  try {
    const result = await data.reduce(async (queue, tweet) => {
      try {
        const collection = await queue;
        collection.push(await es.index({
          index: 'tweets',
          type: 'tweet',
          body: tweet,
        }));

        return collection;
      } catch (e) {
        console.error(e);
        return queue;
      }
    }, Promise.resolve([]));

    console.dir(result);
  } catch (e) {
    console.error(e);
  }
});
