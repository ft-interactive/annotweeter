import * as React from 'react';
import * as _ from 'lodash';

import {
  SearchkitManager, SearchkitProvider,
  SearchBox, RefinementListFilter, MenuFilter,
  Hits, HitsStats, NoHits, Pagination, SortingSelector,
  SelectedFilters, ResetFilters, ItemHistogramList,
  Layout, LayoutBody, LayoutResults, TopBar,
  SideBar, ActionBar, ActionBarRow,
} from 'searchkit';

require('./index.scss');

const host = '/api/';
const searchkit = new SearchkitManager(host);

class TweetHitsGridItem extends React.Component {
  constructor(props) {
    super();
    if (props.result) {
      this.result = props.result;
      if (this.result._source.entities) {
        this.url = this.result._source.entities[0].url;
      }
    }
  }

  componentWillMount() {
    if (this.url) {
      fetch(`https://publish.twitter.com/oembed?url=${this.url}`)
        .then(res => res.text())
        .then(txt => this.setState(txt));
    }
  }

  render() {
    const tweetMarkup = this.state;
    console.dir(this.result);
    const result = this.result;
    if (tweetMarkup) {
      console.dir(tweetMarkup);
      return (
        <div data-qa="hit">
          <div dangerouslySetInnerHTML={{ __html: tweetMarkup }} />
        </div>
      );
    } else {
      return (
        <div data-qa="hit">
          {result._source.text}
        </div>
      );
    }
  }
}

/* <div className={bemBlocks.item().mix(bemBlocks.container('item'))} data-qa="hit">
  <a href={url} target="_blank" rel="noopener noreferrer">
    <img data-qa="poster" alt="" className={bemBlocks.item('poster')} src={result._source.poster} width="170" height="240" />
    <div data-qa="title" alt="" className={bemBlocks.item('title')} dangerouslySetInnerHTML={{ __html: source.title }} />
  </a>
</div> */

// TweetHitsGridItem.propTypes = {
//   result: HitItemProps.isRequired,
// };

export default function () {
  return (
    <SearchkitProvider searchkit={searchkit}>
      <Layout>
        <TopBar>
          <SearchBox
            autofocus
            searchOnChange
            placeholder="Search tweets..."
            prefixQueryFields={['user.screen_name^1', 'text^2']}
          />
        </TopBar>
        <LayoutBody>
          <SideBar>
            <RefinementListFilter
              id="tweeted-by"
              title="Tweeted by..."
              field="username.raw"
              operator="AND"
              size={10}
            />
          </SideBar>
          <LayoutResults>
            <ActionBar>
              <ActionBarRow>
                <HitsStats />
                <SortingSelector
                  options={[
                      { label: 'Relevance', field: '_score', order: 'desc', defaultOption: true },
                      { label: 'Latest tweets', field: 'id_str', order: 'desc' },
                      { label: 'Earliest tweets', field: 'id_str', order: 'asc' },
                  ]}
                />
              </ActionBarRow>
              <ActionBarRow>
                <SelectedFilters />
                <ResetFilters />
              </ActionBarRow>
            </ActionBar>
            <Hits
              mod="sk-hits-grid" hitsPerPage={10} itemComponent={TweetHitsGridItem}
              sourceFilter={['username']}
            />
            <NoHits />
            <Pagination showNumbers />
          </LayoutResults>
        </LayoutBody>
      </Layout>
    </SearchkitProvider>
  );
}
