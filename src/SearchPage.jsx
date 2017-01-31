import * as React from 'react';
import { Tweet } from 'react-twitter-widgets';
import {
  SearchkitManager, SearchkitProvider,
  SearchBox, MenuFilter,
  Hits, HitsStats, NoHits, Pagination, SortingSelector,
  SelectedFilters, ResetFilters, ItemHistogramList,
  Layout, LayoutBody, LayoutResults, TopBar,
  SideBar, ActionBar, ActionBarRow, TagCloud,
} from 'searchkit';

import Annotations from './AnnotationList';

require('./index.scss');

const host = '/api/';
const searchkit = new SearchkitManager(host);

const TweetHitsGridItem = props => (
  // <div className={props.bemBlocks.item().mix(props.bemBlocks.container('item'))} data-qa="hit">
  <div className="hit-item">
    <Tweet data-qa="hit" tweetId={props.result._source.id_str} options={{ width: 'auto' }} />
    <Annotations tweetId={props.result._source.id_str} />
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
          <div className="logo">Anno<strong>tweeter</strong></div>
          <SearchBox
            autofocus
            searchOnChange
            placeholder="Search tweets..."
            prefixQueryFields={['text^1', 'user.screen_name']}
          />
        </TopBar>
        <LayoutBody>
          <SideBar>
            <MenuFilter
              field="user.screen_name.keyword"
              title="Tweeted by..."
              id="histogram-list"
              listComponent={ItemHistogramList}
            />
            {/* <DynamicRangeFilter
              field="@timestamp"
              rangeFormatter={formatDate}
              id="Date"
              title="Date range..."
            /> */}
            <MenuFilter
              field="text"
              title="Keywords"
              id="tag-cloud"
              listComponent={TagCloud}
            />
          </SideBar>
          <LayoutResults>
            <ActionBar>
              <ActionBarRow>
                <HitsStats />
                <SortingSelector
                  options={[
                      { label: 'Latest tweets', field: '@timestamp', order: 'desc', defaultOption: true },
                      { label: 'Earliest tweets', field: '@timestamp', order: 'asc' },
                      { label: 'Relevance', field: '_score', order: 'desc' },
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
