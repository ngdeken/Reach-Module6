/*deken0923@gmail.com
  Ng De Ken
  Hen#7328
*/
'reach 0.1';

const [ isFortune, LUCKY, NORMAL, UNLUCKY ] = makeEnum(3);
const [ isDecision, FALSE, TRUE] = makeEnum(2);

const Player = {
    ...hasRandom,
    getFortune: Fun([], UInt),
    seeDecision: Fun([], UInt),
    seeOutcome: Fun([UInt], Null),
};

export const main = Reach.App(() => {
    const Alice = Participant('Alice', {
        ...Player,
        payment: UInt,
    });

    const Bob= Participant('Bob', {
        ...Player,
        acceptPayment: Fun([UInt], Null),
    });
    init();

    Alice.only(() => {
        const payment = declassify(interact.payment);
    });
    Alice.publish(payment)
        .pay(payment);
    commit();

    Bob.only(() => {
        interact.acceptPayment(payment);
    });
    Bob.pay(payment);
    
    var outcome = FALSE;
    invariant( balance() == 2 * payment  );
    
    while ( outcome == FALSE ){
        commit();

        Bob.only(() => {
            const fortune = declassify(interact.getFortune());
        });
        Bob.publish(fortune);
        commit();

        Alice.only(() => {
            const decisionAlice = declassify(interact.seeDecision());
        });
        Alice.publish(decisionAlice);

        outcome = decisionAlice;
        continue;
    }

    transfer( 2* payment).to(Bob);
    commit();

    each([Alice, Bob], () => {
        interact.seeOutcome(outcome);
    });
});
