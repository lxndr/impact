import React from 'react';

export class Preferences extends React.Component {
  static propTypes = {
    history: React.PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  render() {
    return (
      <preferences>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="libraryPath">Library path</label>
            <input id="libraryPath" name="libraryPath"/>
          </div>
          <div>
            <button type="submit">Save</button>
            <button onClick={this.handleCancel}>Cancel</button>
          </div>
        </form>
      </preferences>
    );
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  handleCancel() {
    this.props.history.goBack();
  }
}
