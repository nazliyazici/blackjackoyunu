let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0;

let yourCardCount = 0;
let dealerCardCount = 0;

let hidden;
let deckId;

let canHit = true;

let yourAceValues = [];
let dealerAceValues = [];

window.onload = async function () {
    document.getElementById('start').addEventListener('click', startGame);
    document.getElementById('restart').addEventListener('click', restartGame);
    document.getElementById('hit').addEventListener('click', hit);
    document.getElementById('stay').addEventListener('click', stay);

    document.getElementById('restart').style.display = 'none';
    document.getElementById('hit').style.display = 'none';
    document.getElementById('stay').style.display = 'none';
};

async function buildDeck() {
    const res = await fetch('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const data = await res.json();
    deckId = data.deck_id;
}

async function drawCards(count) {
    const res = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
    const data = await res.json();
    return data.cards;
}

async function startGame() {
    await buildDeck();
    document.getElementById('start').style.display = 'none';
    document.getElementById('restart').style.display = 'none';
    document.getElementById('hit').style.display = 'inline-block';
    document.getElementById('stay').style.display = 'inline-block';

    const dealerHand = await drawCards(2);
    hidden = dealerHand[0];

    dealerSum = 0;
    dealerAceCount = 0;
    dealerHand.forEach(card => {
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
    });

    dealerSum = reduceAce(dealerSum, dealerAceCount);

    let dealerCardImg = document.createElement('img');
    dealerCardImg.src = dealerHand[1].image;
    document.getElementById('dealer-cards').append(dealerCardImg);

    const playerHand = await drawCards(2);

    yourSum = 0;
    yourAceCount = 0;
    playerHand.forEach(card => {
        let cardImg = document.createElement('img');
        cardImg.src = card.image;
        document.getElementById('your-cards').append(cardImg);
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        yourCardCount++;

        // Eğer AS ise, diziye ekle
        if (card.value === 'ACE') {
            yourAceValues.push(11);  // AS başlangıçta 11 olarak ekleniyor
        }
    });

    yourSum = adjustForAces(yourSum, yourAceValues);
    document.getElementById('your-sum').innerText = 'Toplam: ' + yourSum;

    if (yourSum === 21) {
        document.getElementById('results').innerText = 'Kazandın!';
        document.getElementById('hit').style.display = 'none';
        document.getElementById('stay').style.display = 'none';
        document.getElementById('restart').style.display = 'inline-block';
        canHit = false;
    }
}

async function restartGame() {
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    yourCardCount = 0;
    dealerCardCount = 0;
    canHit = true;
    yourAceValues = [];
    dealerAceValues = [];

    document.getElementById('dealer-cards').innerHTML = '';
    document.getElementById('your-cards').innerHTML = '';
    document.getElementById('dealer-sum').innerText = '';
    document.getElementById('your-sum').innerText = '';
    document.getElementById('results').innerText = '';

    let hiddenCardImg = document.createElement('img');
    hiddenCardImg.id = 'hidden';
    hiddenCardImg.src = 'img/BACK.png';
    document.getElementById('dealer-cards').append(hiddenCardImg);

    await startGame();
}

function showDealerHiddenCard() {
    document.getElementById('hidden').src = hidden.image;
    document.getElementById('dealer-sum').innerText = 'Toplam: ' + dealerSum;
}

async function hit() {
    if (!canHit || yourCardCount >= 5) return;

    const playerNewCard = await drawCards(1);
    const playerCard = playerNewCard[0];
    let playerCardImg = document.createElement('img');
    playerCardImg.src = playerCard.image;
    document.getElementById('your-cards').append(playerCardImg);

    const cardValue = getValue(playerCard);
    yourSum += cardValue;
    yourCardCount++;

    // Eğer AS ise, diziye ekle
    if (playerCard.value === 'ACE') {
        yourAceValues.push(11);  // AS başlangıçta 11 olarak ekleniyor
    }

    yourSum = adjustForAces(yourSum, yourAceValues);
    document.getElementById('your-sum').innerText = 'Toplam: ' + yourSum;

    if (yourSum === 21) {
        canHit = false;
        showDealerHiddenCard();
        document.getElementById('results').innerText = 'Kazandın!';
        document.getElementById('restart').style.display = 'inline-block';
        document.getElementById('hit').style.display = 'none';
        document.getElementById('stay').style.display = 'none';
    } else if (yourSum > 21) {
        canHit = false;
        showDealerHiddenCard();
        document.getElementById('results').innerText = 'Kaybettin!';
        document.getElementById('restart').style.display = 'inline-block';
        document.getElementById('hit').style.display = 'none';
        document.getElementById('stay').style.display = 'none';
    }
}

async function stay() {
    canHit = false;
    showDealerHiddenCard();

    while (dealerSum < 17 && dealerCardCount < 5) {
        const dealerNewCard = await drawCards(1);
        const dealerCard = dealerNewCard[0];
        let dealerCardImg = document.createElement('img');
        dealerCardImg.src = dealerCard.image;
        document.getElementById('dealer-cards').append(dealerCardImg);

        const cardValue = getValue(dealerCard);
        dealerSum += cardValue;

        if (dealerCard.value === 'ACE') {
            dealerAceValues.push(11);  // AS başlangıçta 11 olarak ekleniyor
        }

        dealerSum = adjustForAces(dealerSum, dealerAceValues);
        dealerCardCount++;
        document.getElementById('dealer-sum').innerText = 'Toplam: ' + dealerSum;

        if (dealerSum > 21) {
            document.getElementById('results').innerText = 'Kazandın!';
            document.getElementById('restart').style.display = 'inline-block';
            return;
        }
        if(dealerCardCount >=5){
            break;
        }
    }

    let message = dealerSum > 21 ? 'Kazandın!' :
        yourSum > 21 ? 'Kaybettin!' :
        yourSum === dealerSum ? 'Berabere!' :
        yourSum > dealerSum ? 'Kazandın!' : 'Kaybettin!';

    document.getElementById('results').innerText = message;
    document.getElementById('restart').style.display = 'inline-block';
    document.getElementById('hit').style.display = 'none';
    document.getElementById('stay').style.display = 'none';
}

function getValue(card) {
    return ['KING', 'QUEEN', 'JACK'].includes(card.value) ? 10 :
           card.value === 'ACE' ? 11 : parseInt(card.value);
}

function checkAce(card) {
    return card.value === 'ACE' ? 1 : 0;
}

function reduceAce(sum, aceCount) {
    while (sum > 21 && aceCount > 0) {
        sum -= 10;
        aceCount--;
    }
    return sum;
}

function adjustForAces(sum, aceValues) {
    for (let i = 0; i < aceValues.length; i++) {
        if (sum > 21 && aceValues[i] === 11) {
            aceValues[i] = 1;
            sum -= 10;
        }
    }
    return sum;
}
