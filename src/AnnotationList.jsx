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
        {annotationList.map(item => <Annotation contents={item} />)}
        {this.state.isEditing ? (
          <AnnotationEditor toggle={this.toggleEditor} />
        ) : (
          <button onClick={this.addAnnotation}>Add annotation...</button>
        )}
      </div>
    );
  }

}

Annotations.propTypes = propTypes;
Annotations.defaultProps = defaultProps;
