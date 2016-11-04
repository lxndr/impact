import _, {bindKey} from 'lodash';
import React from 'react';

export class Preferences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <preferences>
        <form onSubmit={bindKey(this, 'submit')}>
          <div>
            <label htmlFor="libraryPath">Library path</label>
            <input id="libraryPath" name="libraryPath" />
          </div>
          <div>
            <button type="submit">Save</button>
            <button onClick={bindKey(this, 'back')}>Cancel</button>
          </div>
        </form>
      </preferences>
    );
  }

  submit() {
  }

  back() {
  }
}

Preferences.propTypes = {
  track: React.PropTypes.object,
  onPrevious: React.PropTypes.func,
  onToggle: React.PropTypes.func,
  onNext: React.PropTypes.func
};
