import React from 'react';
import PlayerViews from './PlayerViews';

const exports = {...PlayerViews};

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

exports.Wrapper = class extends React.Component {
  render() {
    const {content} = this.props;
    return (
      <div className="Deployer">
        <h2>Deployer (Alice)</h2>
        {content}
      </div>
    );
  }
}

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

exports.SetPayment = class extends React.Component {
  render() {
    const {parent, defaultPayment, standardUnit} = this.props;
    const payment = (this.state || {}).payment || defaultPayment;
    return (
      <div>
        <input
          type='number'
          placeholder={defaultPayment}
          onChange={(e) => this.setState({payment: e.currentTarget.value})}
        /> {standardUnit}
        <br />
        <button
          onClick={() => parent.setPayment(payment)}
        >Set payment</button>
      </div>
    );
  }
}

exports.Deploy = class extends React.Component {
  render() {
    const {parent, payment, standardUnit} = this.props;
    return (
      <div>
        Payment (pay to deploy): <strong>{payment}</strong> {standardUnit}
        <br />
        <button
          onClick={() => parent.deploy()}
        >Deploy</button>
      </div>
    );
  }
}

exports.Deploying = class extends React.Component {
  render() {
    return (
      <div>Deploying... please wait.</div>
    );
  }
}

exports.WaitingForAttacher = class extends React.Component {
  async copyToClipboard(button) {
    const {ctcInfoStr} = this.props;
    navigator.clipboard.writeText(ctcInfoStr);
    const origInnerHTML = button.innerHTML;
    button.innerHTML = 'Copied!';
    button.disabled = true;
    await sleep(1000);
    button.innerHTML = origInnerHTML;
    button.disabled = false;
  }

  render() {
    const {ctcInfoStr} = this.props;
    return (
      <div>
        Waiting for Attacher to join...
        <br /> Please give them this contract info:
        <pre className='ContractInfo'>
          {ctcInfoStr}
        </pre>
        <button
          onClick={(e) => this.copyToClipboard(e.currentTarget)}
        >Copy to clipboard</button>
      </div>
    )
  }
}

export default exports;
