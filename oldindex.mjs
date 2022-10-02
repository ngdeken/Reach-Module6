/*deken0923@gmail.com
  Ng De Ken
  Hen#7328

  If I refuse to answer a ask.yesno with a "y" or "n", the program will ask for y/n answer only.
  If I omit ask.done(), the program will not exit.
*/
import { loadStdlib, ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const isAlice = await ask.ask(
    `Are you Alice?`,
    ask.yesno
);
const who = isAlice ? 'Alice' : 'Bob';

console.log(`Starting fortune telling as ${who}`);

let acc = null;
const createAcc = await ask.ask(
    `Would you like to create an account? (only possible on devnet)`,
    ask.yesno
);

if (createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
}   else {
    const secret = await ask.ask(
        `What is your account secret?`,
        (x => x)
    );
    acc = await stdlib.newAccountFromSecret(secret);
}

let ctc = null;
if (isAlice) {
    ctc = acc.contract(backend);
    ctc.getInfo().then((info) => {
        console.log(`The contract is deployed as = ${JSON.stringify(info)}`); 
    });
}   else {
    const info = await ask.ask(
        `Please paste the contract information:`,
        JSON.parse
    );
    ctc = acc.contract(backend, info);
}

const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async (who) => fmt(await stdlib.balanceOf(acc));

const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = { ...stdlib.hasRandom };

if ( isAlice ) {
    const amt = await ask.ask(
        `How much do you want to pay?`,
        stdlib.parseCurrency
    );
    interact.payment = amt;
}   else {
    interact.acceptPayment = async (amt) => {
        const accepted = await ask.ask(
            `Do you accept the payment of ${fmt(amt)}?`,
            ask.yesno
        );
        if(!accepted) {
            process.exit(0);
        }
    };
}


const FORTUNE = ['Lucky', 'Normal', 'Unlucky'];
const FORTUNES = {
    'Lucky': 0, 'L': 0, 'l': 0,
    'Normal': 1, 'N': 1, 'n': 1,
    'Unlucky': 2, 'U': 2, 'u': 2,
};

const DECISION = ['False', 'True'];
const DECISIONS = {
    'False': 0, 'F': 0, 'f': 0,
    'True': 1, 'T': 1, 't': 1,
};

if(isAlice){
    interact.seeDecision = async() => {
        const decision = await ask.ask(`What decision do you make?`, (x) => {
            const decision = DECISIONS[x];
            if( decision === undefined ){
                throw Error(`Not a valid decision ${decision}`);
            }
            return decision;

        });
        console.log((`You made decision ${DECISION[decision]}`));
        return decision;
    };
} else{
interact.getFortune = async () => {
        const fortune = await ask.ask(`What fortune do you tell?`, (x) => {
            const fortune = FORTUNES[x];
            if( fortune === undefined ) {
                throw Error(`Not a valid fortune ${fortune}`);
            }
            return fortune;
        });
        console.log(`You told ${FORTUNE[fortune]}`);
        return fortune;
    };
}

const part = isAlice ? ctc.p.Alice : ctc.p.Bob;
await part(interact);

const after = await getBalance();
console.log(`Your balance is now ${after}`);

ask.done();
