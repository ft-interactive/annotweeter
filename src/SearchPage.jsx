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

const host = '/api/tweets';
const searchkit = new SearchkitManager(host);

const TweetHitsGridItem = (props) => {
  const { bemBlocks, result } = props;
  const url = `http://www.imdb.com/title/${result._source.imdbId}`;
  const source = _.extend({}, result._source, result.highlight);
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container('item'))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="poster" className={bemBlocks.item('poster')} src={result._source.poster} width="170" height="240" />
        <div data-qa="title" className={bemBlocks.item('title')} dangerouslySetInnerHTML={{ __html: source.title }} />
      </a>
    </div>
  );
};

export class SearchPage extends React.Component {
  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <TopBar>
            <SearchBox
              autofocus
              searchOnChange
              placeholder="Search tweets..."
              prefixQueryFields={['actors^1', 'type^2', 'languages', 'title^10']}
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
}
