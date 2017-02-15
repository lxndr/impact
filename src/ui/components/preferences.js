import _, {bindKey} from 'lodash';
import React from 'react';
import {routerShape} from 'react-router';

export class Preferences extends React.Component {
  static propTypes = {
    router: routerShape
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.handleSubmit = this.handleSubmit.this(this);
    this.handleCancel = this.handleCancel.this(this);
  }

  render() {
    return (
      <preferences>
        <form onSubmit={bindKey(this, 'submit')}>
          <div>
            <label htmlFor="libraryPath">Library path</label>
            <input id="libraryPath" name="libraryPath"/>
          </div>
          <div>
            <button type="submit">Save</button>
            <button onClick={this.handleSubmit}>Cancel</button>
          </div>
        </form>
      </preferences>
    );
  }

  handleSubmit() {
  }

  handleCancel() {
    this.router.goBack();
  }
}
