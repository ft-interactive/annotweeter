import * as React from 'react';
import * as _ from 'lodash';
import { Tweet } from 'react-twitter-widgets';

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

const TweetHitsGridItem = props => (
  // <div className={props.bemBlocks.item().mix(props.bemBlocks.container('item'))} data-qa="hit">
  <div className="hit-item">
    <Tweet data-qa="hit" tweetId={props.result._source.id_str} options={{ width: 'auto'}} />
    {/* <Annotations tweetId={props.result._source.id_str} /> */}
  </div>
);

// console.dir(Hits.propTypes);

TweetHitsGridItem.propTypes = {
  result: React.PropTypes.object.isRequired,
};

export default function () {
  return (
    <SearchkitProvider searchkit={searchkit}>
      <Layout>
        <TopBar>
          <SearchBox
            autofocus
            searchOnChange
            placeholder="Search tweets..."
            prefixQueryFields={['text^1', 'user.screen_name']}
          />
        </TopBar>
        <LayoutBody>
          <SideBar>
            <RefinementListFilter
              id="tweeted-by"
              title="Tweeted by..."
              field="user.screen_name.raw"
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
                      { label: 'Latest tweets', field: '@timestamp', order: 'desc' },
                      { label: 'Earliest tweets', field: '@timestamp', order: 'asc' },
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
            />
            <NoHits />
            <Pagination showNumbers />
          </LayoutResults>
        </LayoutBody>
      </Layout>
    </SearchkitProvider>
  );
}
