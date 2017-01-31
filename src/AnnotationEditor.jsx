import React, {
  Component,
  PropTypes,
} from 'react';

const propTypes = {
  annotation: PropTypes.object,
  toggle: PropTypes.function,
};

const defaultProps = {
  annotation: {
    text: '',
  },
  toggle: Function,
};

export default class AnnotationEditor extends Component {
  constructor(props) {
    super(props);
    this.annotation = props.annotation;
    this.isNew = !this.annotation.id;
    this.toggle = props.toggle;
  }

  submitAnnotation = (e) => {
    e.preventDefault();

    const annotation = {
      text: this.state.annotationText,
    };

    if (this.isNew) {
      fetch('/api/annotations', {
        method: 'POST',
        body: annotation,
      });
    } else {
      const annotationId = this.annotation.id;
      fetch(`/api/annotations/${annotationId}`, {
        method: 'PUT',
        body: annotation,
      });
    }

    this.toggle();
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
