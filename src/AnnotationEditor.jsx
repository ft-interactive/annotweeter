import React, {
  Component,
  PropTypes,
} from 'react';

const propTypes = {
  annotation: PropTypes.object,
  annotationId: PropTypes.string,
  toggle: PropTypes.func,
  tweetId: PropTypes.string.isRequired,
};

const defaultProps = {
  annotation: {
    text: '',
  },
  annotationId: false,
  toggle: Function,
};

export default class AnnotationEditor extends Component {
  constructor(props) {
    super(props);
    this.annotation = props.annotation;
    this.annotationId = props.annotationId;
    this.isNew = !this.annotationId;
    this.toggle = props.toggle;
    this.tweetId = props.tweetId;
  }

  submitAnnotation = (e) => {
    e.preventDefault();

    const annotation = {
      text: this.state.annotationText,
      parentId: this.tweetId,
    };

    if (this.isNew) {
      fetch('/api/annotations', {
        method: 'POST',
        body: JSON.stringify(annotation),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(this.toggle);
    } else {
      const annotationId = this.annotationId;
      fetch(`/api/annotations/${annotationId}`, {
        method: 'PUT',
        body: JSON.stringify(annotation),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(this.toggle);
    }
  }

  handleChange = (e) => {
    this.setState({
      annotationText: e.target.value,
    });
  }

  render() {
    return (
      <form onSubmit={this.submitAnnotation}>
        <textarea
          name="edit-annotation"
          defaultValue={this.annotation.text}
          onChange={this.handleChange}
        />
        <label htmlFor="edit-annotation">
          Markdown supported: _italics_, **bold**, [a link](http://url), ![alt text](http://url.jpg)
        </label>
        <input type="submit" value={this.isNew ? 'Add annotation' : 'Update annotation'} />
      </form>
    );
  }

}

AnnotationEditor.propTypes = propTypes;
AnnotationEditor.defaultProps = defaultProps;
