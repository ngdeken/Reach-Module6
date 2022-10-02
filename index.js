import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
//import PlayerViews from './views/PlayerViews.js';
import { renderDOM, renderView } from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
const reach = loadStdlib(process.env);

import { ALGO_MyAlgoConnect as MyAlgoConnect }
    from '@reach-sh/stdlib';
reach.setWalletFallback(reach.walletFallback({
    providerEnv: 'TestNet', MyAlgoConnect
}));

const fortuneToInt = {'LUCKY': 0, 'NORMAL': 1, 'UNLUCKY': 2};
const intToDecision = {'FALSE':0, 'TRUE':1};
const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultPayment: '3', standardUnit};

class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {view: 'ConnectAccount', ...defaults};
    }
    async componentDidMount() {
        const acc = await reach.getDefaultAccount();
        const balAtomic = await reach.balanceOf(acc);
        const bal = reach.formatCurrency(balAtomic, 4);
        this.setState({acc, bal});
        if (await reach.canFundFromFaucet()) {
            this.setState({view: 'FundAccount'});
        }   else {
            this.setState({view: 'DeployerOrAttacher'});
        }
    }
    async fundAccount(fundAmount) {
        await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount));
        this.setState({view: 'DeployerOrAttacher'});
    }
    async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'}); }
    selectAttacher() { this.setState({view: 'Wrapper', ContentView: Attacher}); }
    selectDeployer() { this.setState({view: 'Wrapper', ContentView: Deployer}); }
    render() { return renderView(this, AppViews); }
}

class Player extends React.Component {
    random() { return reach.hasRandom.random(); }
    async getFortune() {
        const fortune = await new Promise(resolveFortuneP => {
            this.setState({view: 'GetFortune', playable: true, resolveFortuneP});
        });
        this.setState({view: 'WaitingForResults', fortune});
        return fortuneToInt[fortune];
    }
    async seeDecision() {
        const decision = await new Promise(resolveDecisionP => {
            this.setState({view: 'SeeDecision', playable: true, resolveDecisionP});
        });
        this.setState({view: 'WaitingForResults', decision});
        return intToDecision[decision];
    }
    tellDecision(decision) { this.state.resolveDecisionP(decision); }
    tellFortune(fortune) { this.state.resolveFortuneP(fortune); }
    seeOutcome(decision) { this.setState({view: 'Done', decision: intToDecision[decision]}); }
}

class Deployer extends Player {
    constructor(props) {
        super(props);
        this.state = {view: 'SetPayment'};
    }
    setPayment(payment) { this.setState({view: 'Deploy', payment}); }
    async deploy() {
        const ctc = this.props.acc.contract(backend);
        this.setState({view: 'Deploying', ctc});
        this.payment = reach.parseCurrency(this.state.payment);
        backend.Alice(ctc, this);
        const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
        this.setState({view: 'WaitingForAttacher', ctcInfoStr});
    }
    
    render() { return renderView(this, DeployerViews); }
}

class Attacher extends Player {
    constructor(props) {
        super(props);
        this.state = {view: 'Attach'};
    }
    attach(ctcInfoStr) {
        const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr));
        this.setState({view: 'Attaching'});
        backend.Bob(ctc, this);
    }
    
    async acceptPayment(paymentAtomic) {
        const payment = reach.formatCurrency(paymentAtomic, 4);
        return await new Promise(resolveAcceptedP => {
            this.setState({view: 'AcceptTerms', payment, resolveAcceptedP});
        });
    }
    termsAccepted() {
        this.state.resolveAcceptedP();
        this.setState({view: 'WaitingForTurn'});
    }
    
    render() { return renderView(this, AttacherViews); }

}

renderDOM(<App />);
