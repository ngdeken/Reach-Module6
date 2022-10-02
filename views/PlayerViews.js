import React from 'react';

const exports = {};

// Player views must be extended.
// It does not have its own Wrapper view.

exports.SeeDecision = class extends React.Component {
    render() {
      const {parent, playable, decision} = this.props;
      return (
        <div>
          {decision ? 'It was false! Pick again.' : ''}
          <br />
          {!playable ? 'Please wait...' : ''}
          <br />
          <button
            disabled={!playable}
            onClick={() => parent.tellDecision('FALSE')}
          >False</button>
          <button
            disabled={!playable}
            onClick={() => parent.tellDecision('TRUE')}
          >True</button>
        </div>
      );
    }
  }

  exports.GetFortune = class extends React.Component {
    render() {
      const {parent, playable, fortune} = this.props;
      return (
        <div>
          {fortune ? 'It was false! Pick again.' : ''}
          <br />
          {!playable ? 'Please wait...' : ''}
          <br />
          <button
            disabled={!playable}
            onClick={() => parent.tellFortune('LUCKY')}
          >Lucky</button>
          <button
            disabled={!playable}
            onClick={() => parent.tellFortune('NORMAL')}
          >Normal</button>
          <button
            disabled={!playable}
            onClick={() => parent.tellFortune('UNLUCKY')}
          >Unlucky</button>
        </div>
      );
    }
  }
  


exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for results...
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {decision} = this.props;
    return (
      <div>
        Thank you for playing. The outcome of this fortune was:
        <br />True
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div>
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

export default exports;
