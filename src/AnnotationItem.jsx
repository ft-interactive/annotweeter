import React, {
  Component,
  PropTypes,
} from 'react';
import ReactMarkdown from 'react-markdown';

import AnnotationEditor from './AnnotationEditor';

const propTypes = {
  item: PropTypes.object.isRequired,
  tweetId: PropTypes.string,
};

const defaultProps = {
  tweetId: '',
};

export default class Annotation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      styles: {
        display: 'block',
      },
    };
    this.annotation = props.item._source;
    this.tweetId = props.tweetId;
    this.annotationId = props.item._id;
    this.parentId = props.item._routing;
    this.author = this.annotation.author || 'unknown author';
  }

  toggleEditor = () => {
    this.setState({ isEditing: !this.state.isEditing });
  }

  deleteAnnotation = () => {
    fetch(`/api/annotation/${this.annotationId}/${this.parentId}`, {
      method: 'DELETE',
      body: JSON.stringify(this.annotation),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(() => {
      this.setState({ styles: { display: 'none' } });
    });
  }

  render() {
    const annotationText = this.annotation.text;
    return this.state.isEditing ?
      <AnnotationEditor
        annotation={this.annotation}
        annotationId={this.annotationId}
        tweetId={this.tweetId}
        toggle={this.toggleEditor}
      />
    : (
      <div className="annotation" style={this.state.styles}>
        <div className="o-card">
          <div className="o-card__content">
            <h2 className="o-card__heading">{ this.author }</h2>
            <ReactMarkdown source={annotationText} />
          </div>
        </div>

        <button onClick={this.toggleEditor}>Edit</button>
        <button onClick={this.deleteAnnotation}>Delete</button>
      </div>
    );
  }

}

Annotation.propTypes = propTypes;
Annotation.defaultProps = defaultProps;
