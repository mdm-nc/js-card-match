
class AudioController {
    constructor() {
        this.bgMusic = new Audio('Assets/Audio/carol.mp3');
        this.flipSound = new Audio('Assets/Audio/flip.wav');
        this.matchSound = new Audio('Assets/Audio/bells.wav');
        //this.victorySound = new Audio('Assets/Audio/victory.wav');
        this.victorySound = new Audio('Assets/Audio/merry-christmas.mp3');
        //this.gameOverSound = new Audio('Assets/Audio/gameover.wav');
        this.gameOverSound = new Audio('Assets/Audio/bah-humbug.wav');
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }
    startMusic () {
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class CardMatchGame {
  constructor(totalTime, cards) {
    this.cardsArray = cards;
    this.totalTime = totalTime;
    this.timeRemaining = totalTime;
    this.timer = document.getElementById("time-remaining");
    this.ticker = document.getElementById("flips");
    this.audioController = new AudioController();
  }

  startGame() {
    // start or reset game
    this.cardToCheck = null; // 1st card - the one you're trying to match
    this.totalClicks = 0;
    this.timeRemaining = this.totalTime;
    this.matchedCards = []; //reset array
    this.busy = true; // wait for start game overlay to be clicked

    //wait 500 ms before starting - smooths out transition between games
    setTimeout(() => {
        this.audioController.startMusic();
        this.shuffleCards();
        this.countDown = this.startCountDown();
        this.busy = false;
    }, 500);

    //flip all cards back over and restart timers
    this.hideCards();
    this.timer.innerText = this.timeRemaining;
    this.ticker.innerText = this.totalClicks;

  }

  canFlipCard(card) {
    //Checks to see if can flip a card (shuffling, not busy, not already flipped, not the card your trying to match)
    return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
  }

  hideCards() {
    this.cardsArray.forEach(card => {
        card.classList.remove('visible');
        card.classList.remove('matched');
    });
  }

  startCountDown() {
    return setInterval(() => {
        this.timeRemaining--;
        this.timer.innerText = this.timeRemaining;
        if(this.timeRemaining === 0)
            this.gameOver();
    }, 1000);
  }

  gameOver() {
    clearInterval(this.countDown);
    this.audioController.gameOver();
    document.getElementById('game-over-text').classList.add('visible'); //show game over overlay
  }

  victory() {
    clearInterval(this.countDown);
    this.audioController.victory();
    document.getElementById('victory-text').classList.add('visible'); //show game over overlay
  }

  flipCard(card) {
    if( this.canFlipCard(card)) {
        this.audioController.flip();
        this.totalClicks++;
        //set html element Flips 
        this.ticker.innerText = this.totalClicks;
        //flip the card
        card.classList.add('visible');

        if(this.cardToCheck) 
            this.checkForCardMatch(card)
        else 
            this.cardToCheck = card;
    }
  }

  checkForCardMatch(card) {
    if(this.getCardType(card) === this.getCardType(this.cardToCheck))
        this.cardMatch(card, this.cardToCheck);
    else 
        this.cardMisMatch(card, this.cardToCheck);

    //clear the card to check value
    this.cardToCheck = null;
  }

  cardMatch(card1, card2) {
    //Add cards to matched cards array
    this.matchedCards.push(card1);
    this.matchedCards.push(card2);
    card1.classList.add('matched');
    card2.classList.add('matched');
    this.audioController.match();
    if (this.matchedCards.length === this.cardsArray.length) 
        this.victory();
  }

  cardMisMatch(card1, card2) {
    //don't let user keep clicking until cards flip back over
    this.busy = true;
    setTimeout(() => {
        card1.classList.remove('visible');
        card2.classList.remove('visible');
        this.busy = false; // now user can continue
    }, 1000);
  }

  getCardType(card) {
    //returns the src attribute (image filename and path)
    return card.getElementsByClassName('card-value')[0].src; //index is 0 b/c there is only one card-value per card in the html file
  }

  shuffleCards() {
    for(let i = this.cardsArray.length - 1; i > 0; i--) {
        //fisher-yates shuffle
        // take a random number >=0 and <1, multiply it by the index, and round down
        let randomIndex = Math.floor(Math.random() * (i+1));
        this.cardsArray[randomIndex].style.order = i; //not changing positin of items in array, just reordering the way it is displayed
        this.cardsArray[i].style.order = randomIndex;
    }
  }
}

function ready() {
	let overlays = Array.from(document.getElementsByClassName('overlay-text')); 
	let cards = Array.from(document.getElementsByClassName('card'));
    //let game = new CardMatchGame(100, cards);
    let game = new CardMatchGame(100, cards);

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        })
    })
    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    })
}

if(DocumentTimeline.readyState ==='loading') {
    Document.addEventListener('DOMContentLoaded', ready());
} else {
    ready(); //document is done loading
}



