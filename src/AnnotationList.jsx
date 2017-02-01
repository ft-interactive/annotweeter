import React, {
  Component,
  PropTypes,
} from 'react';

import Annotation from './AnnotationItem';
import AnnotationEditor from './AnnotationEditor';

const propTypes = {
  tweetId: PropTypes.string.isRequired,
};

const defaultProps = {};

export default class Annotations extends Component {

  constructor(props) {
    super(props);
    this.state = {
      annotations: [],
      isEditing: false,
    };
    this.tweetId = props.tweetId;
    this.getAnnotations(this.tweetId);
  }

  /**
   * This pings the API, which pings ES for any annotations.
   * Ultimately this is suboptimal as it creates a huge number
   * of requests to ES and the "staging" plan on Bonsai is limit to like
   * 5 simultaneous read connections.
   *
   * A better approach would be to batch requests and then pass them down
   * to the annotator components. @TODO This ^^
   *
   * @param  {string|number} tweetId Twitter tweet ID.
   * @return {void}   Sets state after Fetch
   */
  getAnnotations = tweetId => fetch(`/api/annotations/${tweetId}`)
    .then(res => (res ? res.json() : []))
    .then(items => this.setState({
      annotations: items,
    }));

  addAnnotation = () => {
    this.setState({ isEditing: true });
  }

  toggleEditor = () => {
    this.setState({ isEditing: !this.state.isEditing });
    this.getAnnotations(this.tweetId);
  }

  render() {
    const annotationList = this.state.annotations;
    return (
      <div className="annotation-list">
        {this.state.isEditing ? (
          <AnnotationEditor
            toggle={this.toggleEditor}
            tweetId={this.tweetId}
            list={annotationList}
          />
        ) : (
          <button onClick={this.addAnnotation}>Add annotation...</button>
        )}
        {annotationList.map(item =>
          <Annotation
            tweetId={this.tweetId}
            item={item}
            key={item._id}
          />,
        )}
      </div>
    );
  }

}

Annotations.propTypes = propTypes;
Annotations.defaultProps = defaultProps;
