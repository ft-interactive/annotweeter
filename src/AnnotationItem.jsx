import React, {
  Component,
  PropTypes,
} from 'react';
// import ReactMarkdown from 'react-markdown';

import AnnotationEditor from './AnnotationEditor';

const propTypes = {
  annotation: PropTypes.object.isRequired,
};

const defaultProps = {};

export default class Annotation extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.isEditing = false;
    this.annotation = props.annotation;
  }

  render() {
    const annotationText = this.annotation.text;
    return this.isEditing ? <AnnotationEditor annotation={this.annotation} /> : (
      <div className="annotation">
        {/* <ReactMarkdown source={annotationText} /> */}
        <button onClick={this.editAnnotation}>Edit</button>
      </div>
    );
  }

}

Annotation.propTypes = propTypes;
Annotation.defaultProps = defaultProps;
