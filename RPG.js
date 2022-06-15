const prompt = require('prompt-sync')({sigint: true});


//class used for charater data storage and action methods
class CharaterCreator {
    constructor (name) {
        this.name = name
        this.HP = 4
    }

    //decrements health value by specific amount
    changeHp (amount) {
        this.HP += amount
    }

    //prints prompt as str to console and takes user input, switches different actions depending on input
    promptUser (str) {
        let validAction = false
        do {
            let action = prompt(str).toLowerCase()
            switch (action) {

                //displays user health
                case ('health') : {
                    console.log(`your current health is: ${this.HP}\n`)
                    break
                }
                
                //gives user option to quit game
                case ('quit') : {
                    let validQuit = false
                    while(!validQuit) {
                        let quitter = prompt('\nare you sure you want to quit? y/n: ').toLowerCase()
                        if (quitter === 'y' || quitter == 'yes') {
                            validQuit = true
                            validAction = true
                            console.log('\nsad......\n\n\n')
                            return 1
                        }
                        if (quitter === 'n' || quitter === 'no') {
                            validQuit = true
                            validAction = true
                            scrollText(['\nyou are a brave warrior', 'continue your battle!'])
                        }
                    }
                    break
                }
                
                //enters the woods
                case ('woods') : {
                    validAction = true
                    return 'woods'
                }

                //enters the path
                case ('path') : {
                    validAction = true
                    return 'path'
                }
                
                default : console.log('Not a valid action, please try again\n')
            }
        } while (!validAction)
    }
}

//inital prompt for user name
function userNamePrompt () {
    let userHasValidName
    while (!userHasValidName) {
        let userName = prompt('Decalre your adventurers name... ');
        if (userName.length > 0) {
            userHasValidName = true
            return userName
        } else {
            console.log('please input valid name...')
        }
    }
}

//prints loading dots
function loadAnimation () {
    counter = 0 
    const loadID = setInterval(func => {
        process.stdout.write('.')
        counter++
    }, 300)
    return loadID
}

//prints game welcome message
function printWithAnimation (str1, str2) {
    return new Promise (resolve => {
        process.stdout.write(str1)
        const stop = loadAnimation()
        setTimeout(() => {
            clearInterval(stop)
            resolve(console.log(str2))
        }, 2500)
    })
}

//prints scrolling text from input array, with each element being a new line
//can pass in user name from user object to print in 'intro' (which only runs if 3rd argument is true)
async function scrollText (dialog, name, runIntro = false) {
    
    function timedPrint (str, callback) {
        return new Promise (resolve => {
            if (callback) {
                process.stdout.write(str)
                let stop = callback()
                setTimeout(() => resolve(clearInterval(stop)), 3000)
            } else {
                console.log(str)
                setTimeout(() => resolve(), 2500)
            }
            
        })
    }

    if (runIntro){
        await timedPrint(`\n${name}, You are now being transported`, loadAnimation)
        await timedPrint(' to another time', loadAnimation)
        await timedPrint(' long, long ago', loadAnimation)
    }

    for (let i = 0; i < dialog.length; i++){
        await timedPrint(dialog[i])
    }
}


//runs whatever game creator function is passed in, and returns results
async function playGame (user, gameCreator) {
    await printWithAnimation('\nLet the games begin','\n')
            
    const game = gameCreator(user)
    let hasWon = false

    while (!hasWon) {
        let result = game()
        if (result === 'lost') {
            user.changeHp(-1)
            await scrollText([`Your health is now ${user.HP}\n`])
            if (user.HP <= 0) return 1
            await scrollText(['Lets play again...\n'])
        }
        if (result === 'won'){
            hasWon = true
            return '\n'
        }
    }
}


//main RPG play envrironment
async function playRPG () {
    await printWithAnimation('\nWelcome To', 'THE GAME OF GAMES')

    await scrollText(['','\nYou may enter \"health\" at any time to check your remaining health.','you may also enter \"quit\" to exit the game.\n'])

    const user = new CharaterCreator(userNamePrompt())

    //used to check what direction to go after certain prompts, or if lost exit game
    let exitStatus = 0

    const introDialog = [
        `\n\nSlowly, you open your eyes.`,
        `It's cold, and as you come to your senses, you begin to look around.`,
        `The surroundings are dark and unfamiliar.`,
        `Deep woods, creaking in the howling wind.`,
        `To your right you see a winding, destitute path.`,
        `You rise, take a deep breath, and contemplate...\n`
    ]
    await scrollText(introDialog, user.name, true)

    exitStatus = user.promptUser('Do you wander into the woods, or walk the path? woods/path: ').toLocaleLowerCase()
    if (exitStatus === 1) return console.log('GAME OVER')

    if (exitStatus === 'woods') {
        let woodsResult = await woods(user)
        if (woodsResult === 1) return console.log('GAME OVER')
        const wonBJdialog = [
            `\nAlas, you are victorious!`,
            `Your opponent looks at you indignation in his eyes, but agrees to let you continue on your way.`,
            `After all, 'twas a fair game...`,
            `You carefully climb the steep rock embankment next to the waterfall, and see a winding creek atop the ledge.`,
            `Wearily, you follow the twists and turns of the river.`,
            `The sounds of water spashing over the stones inducing some strange state of trance over you...`,
            `After an unknown duration, you seem to have suddenly appeared at a break in forest.`,
        ]
        await scrollText(wonBJdialog)
    }

    if (exitStatus === 'path') {
        let pathResult = await path(user)
        if (pathResult === 1) return console.log('GAME OVER')
        const wondHangmanDialog = [
            '\nYour opponent shrieks in horror as she sees the marking enscribed on the ledger.',
            'You have defeated her...',
            'In a puff of smoke she vanishes into thin air.',
            'Out of the cloud emerges a bat who disappears into the dusk sky, never to be seen again.',
            'Bewildered, you investigate the trees around you for any signs of the strange woman, only to find the ledger lying blank on the ground.',
            'You quicky flee the area, running as far as you can until your body grows weary.',
            'Just when you think you don\'nt have the energy to go further, you come to a clearing in the woods.'
        ]
        await scrollText(wondHangmanDialog)
    }

    const clearingDialog = [
        'In the middle of the clearing there appears to be a glowing red vile.',
        'You approach the vile, and inspect it closer.',
        'There appears to be strange markings ingraved around the brim, it looks like some type language, though one you have never encountered before.',
        'While holding the bottle, you begin to feel the urge to open it, and consume the contents.',
        'you feel it calling your name.',
        `${user.name}, ${user.name},`
    ]
    await scrollText(clearingDialog)
    await printWithAnimation('drink me','\n')

    
    while(true){
        const drinkBottle = prompt('Do you drink the contents of the bizarre vile? y/n: ')
        if (drinkBottle === 'y' || drinkBottle === 'yes') {
            await scrollText(['\nThe voices echoing in your mind are too loud to ignore.', 'You take a sip from the bottle.'])
            await printWithAnimation('Slowly','')
            user.changeHp(2)
            await scrollText(['You begin to feel stronger',`\nYou now have ${user.HP} health.\n`])
            break
        }
        if (drinkBottle === 'n' || drinkBottle === 'no') {
            await scrollText(['You resist the urge to drink the bottle and put it on the ground.', 'You keep walking and don\'t look back.\n'])
            break
        }
        console.log('\nPlease provide valid response\n')
    }

    let bossResult = await boss(user)
    if (bossResult === 1) return(console.log('GAME OVER'))
    const beatsBoss = [
        'You draw you last marking into the game table, and the statue begins to crumble...',
        'You step away, and watch as the chunks of marble which where once so perfectly carved, collapse to pebbles.',
        'From the rubble appears a liquid disc, that stands vertically on the ground',
        'You touch the disc with the tip of your finger, and feel it draw you in.',
        'The pull is irresistible',
        'you step into it...',
        'And before you can blink...',
        'You are back home.',
        `${user.name}, You have succeeded!!!!\n\n`
    ]
    await scrollText(beatsBoss)
    console.log('WINNER!!!')
    return 0
}

//gameplay if user chooses woods
function woods (user) {
    return new Promise(async function (resolve) {

        const woodsDialog = [
            `\nAs you wander deeper and deeper into the surrounding thicket,`,
            `you begin to hear the babbling of a brook, or some other small body of water flowing in the distance.`,
            `The sound is strangely captivating, and you move closer to inspect what it may be.`,
            `The brush surrounding you begins to clear, and you see a beautiful pond below a trickling waterfall.`,
            `To your great surprise, you see a small man fidling with a deck of cards, seated next to the water.`,
            `As you approach him, he turns his head towards you, and smiles.`,
            `He asks you if you would like to play a game of Black Jack...\n`
        ]
        await scrollText(woodsDialog)

        while (true){
            let playsJack = prompt('Do you play with him? y/n: ').toLocaleLowerCase()
            if (playsJack === 'y' || playsJack === 'yes') {

                return resolve(playGame(user, blackJackCreator))

            } else if (playsJack === 'n' || playsJack === 'no'){
                const doesntPlayJack = [
                    '\nYou tell the man you would rather not play.',
                    'His smile quickly turns to a terrifiying grimice.',
                    'He grabs you with great strength and throws you into the water.',
                    'As you hit the water you feel its current change from a mellow trickle to rushing rapids.',
                    'You are swept away, never to be seen again....\n'
                ]
                await scrollText(doesntPlayJack)
                return resolve(1)
            }
            await scrollText(['Please provide a valid response\n'])
        }
    })
}


//gameplay if user chooses path
function path (user) {
    return new Promise(async function (resolve) {
        const pathDialog = [
            `\nHesitantly, you take a step onto the path, think for a moment....`,
            `and then continue.`,
            `It feels endless.`,
            `Around each bend, the path seems to grow more and more narrow, until the point that it seems as though there might as well be no path at all...`,
            `Mearly a neverending, twisting maze of dececrated wilderness.`,
            `After countless hours of wandering, you turn a corner only to find a hooded figure inscribing some strange charaters onto some type of ancient ledger`,
            `The figure hears your footsteps, and pulls thier hood down to look at you`,
            `She smirks at you, and asks you if you would care to play a game of hangman...\n`
        ]
        await scrollText(pathDialog)

        while (true) {
            let playsHangman = prompt('Do you play with her? y/n: ').toLocaleLowerCase()
            if (playsHangman === 'y' || playsHangman === 'yes') {

                return resolve(playGame(user, hangmanCreator))

            } else if (playsHangman === 'n' || playsHangman === 'no'){
                const doesntPlayHang = [
                    '\nConfusesed and worried, you decline to play the game with the strange woman.',
                    'She begins to laugh uncontrollably, and raises her ledger high into the air.',
                    'Immediately the sound of cracking thunder fills the skys.',
                    'You start to run but soon as lightning strikes all around you, you\'re surrounded by buring trees with nowhere to go...',
                    'You open your mouth to let out a cry for help, but there is no response....\n'
                ]
                await scrollText(doesntPlayHang)
                return resolve(1)
            }
            await scrollText(['Please provide a valid response\n'])
        }
    })
}

function boss(user) {
    return new Promise(async function (resolve) {

        const finalBossDialog = [
            'At the other end of the clearing you see what seems to be a tunnel glowing with prismatic light.',
            'The light attracts you and you move towards it to investigate the source.',
            'It appears to be a tunnel indeed, but this is no ordinary tunnel.',
            'The walls are are adorned with crytal sheets, refelcting brillant beams of light in every color imanginable.',
            'Mesmerized, you seem to float down the halls, almost as if you don\'t even need to use your feet to walk.',
            'Eventually you arrive at the other end of the tunnel, to find a massive courtyard, filled with wonderful marble, crystal, and metallic satues of divine, and heroic figures.',
            'As you stand looking at the count in awe, you notice one of the statues begins to make noises. Sounds of small stones cracking and striking the floor.',
            'To your astonishment, the staue begins to stand, and move toward you',
            'You slowly step back, but the statue, now risen is staring you right in the eyes.'
        ]
        await scrollText(finalBossDialog)
        await printWithAnimation('It utters the words','\"Tic. Tac. Toe.\"\n')
    
    
        while (true) {
            let isPlaying = prompt('Do you agree to play a game of Tic Tac Toe with the giant? y/n: ').toLowerCase()
            if (isPlaying === 'y' || isPlaying === 'yes') {

                return resolve(playGame(user, ticTacToeCreator))

            }
            if (isPlaying === 'n' || isPlaying === 'no') {
                await scrollText(['You try and run, but the state you reaches out and plucks you off the ground.',
                'You struggle to esacpe its grasp, but it is too strong', 'He turns you toward him, and stare you in eyes',
                'You now, have become yet another crystal statue in the courtyard...'])
                return resolve(1)
            }
            await scrollText(['Please provide a valid response\n'])
        }
    })
}

playRPG()

// MINI GAME FUNCTIONS ---------------------------------------------------------------------------- //

//blackjack function creator
function blackJackCreator (user){
    const deck = [2,3,4,5,6,7,8,9,10,11,
                2,3,4,5,6,7,8,9,10,11,
                2,3,4,5,6,7,8,9,10,11,
                2,3,4,5,6,7,8,9,10,11
                ]
    const dealerDeck = [5,6,7,8,9,10,11]

    //method to generate random number from array
    Array.prototype.random = function (){
    return this[Math.floor((Math.random()*this.length))]
    }

    //deal two cards and add sum (first hand)
    function dealSum(inputDeck){
    return inputDeck.random() + inputDeck.random()
    }

    //deal one card
    function deal(inputDeck){
    return inputDeck.random()
    }

    //blackjack game
    function blackjack(){
        let playerSum = dealSum(deck)
        let dealerSum = dealSum(dealerDeck)
        return function dealCards(){
            console.log(`your first hand is ${playerSum}`)
            let playerPrompt = prompt('hit or stay? ')
            do {
                if(playerPrompt === 'hit'){
                playerSum += deal(deck)
                if(playerSum > 21) {
                    console.log('\nbust!\n')
                    return 'lost'
                } 
                playerPrompt = prompt(`you are currently at ${playerSum}, hit or stay? `)
                }
            } while(playerPrompt === 'hit')
            
            if(playerSum > dealerSum){
                console.log('\nyou win!\n')
                return 'won'
            } else if(playerSum === dealerSum) {
                console.log(`\n${playerSum} to ${dealerSum}... you thought a tie would spare you? You still lose.\n`)
                return 'lost'
            } else {
                console.log(`\nyou have ${playerSum} and the dealer has ${dealerSum}. You lose.\n`)
                return 'lost'
            }
        }
    }

    return function letsPlay(){
        let playBlackjack = blackjack()
        let result = playBlackjack()
        return result
    }  
}

//hangman function creator
function hangmanCreator (user) {
    return function startGameHangman (){
        // if (gameStateOn == 1) {return console.log('Okay, next time then!')}
        // //STATE -- 
        // //have a database of words
        const availableWords = ['word'];
        //choose a word and make an array of the letters
        let chosenWord = '';
        function chooseRandomWord (availableWords) {
            let chosenWordIndex = 0;
            chosenWordIndex = Math.floor(Math.random() * availableWords.length);
            return chosenWord = availableWords[chosenWordIndex];
        }
        chooseRandomWord (availableWords);
        let chosenLettersArr = chosenWord.split('');
        let totalAttemptsRemaining = 6
        let totalLettersRemaining = chosenLettersArr.length
        
        let totalTriedFoundLetters = []
        let totalTriedLetters = []
        //AT THIS POINT THE GAMEBOARD IS SET
        
            
        //BELOW this point values will update based on the attempted letter input
        //Start looking for that input 
            
        function pickLetter (letter) {
            if (totalTriedLetters.includes(letter)) {
                console.log('You already did that dummy.')
            } 
            else{
            //CS letters = letters that are in the word and tried
                let triedLettersArr = [letter];
                if (letter) {totalTriedLetters.push(letter)};
                
                //console.log(totalTriedLetters)
                //cs notfoundletters
                let triedNotFoundLettersArr = []
                let triedFoundLettersArr = []
                function lettersNotFound (triedLettersArr) {
                    if (!letter){return}
                    for (let i=0; i<triedLettersArr.length; i++) {
                    if (!chosenLettersArr.includes(triedLettersArr[i])) {
                        triedNotFoundLettersArr.push (triedLettersArr[i]);
                        //totalTriedLetters.push (triedLettersArr[i])
                    }
                    else {triedFoundLettersArr.push(triedLettersArr[i]);}
                        //totalTriedFoundLetters.push(triedLettersArr[i])
                    }
                }
                lettersNotFound (triedLettersArr)
                
                    //CS attempts left = number of not found TRIED
                let attemptsRemaining = totalAttemptsRemaining-triedNotFoundLettersArr.length;
                totalAttemptsRemaining = attemptsRemaining
                    //CS Win Condition
                let lettersRemaining = totalLettersRemaining - triedFoundLettersArr.length
                totalLettersRemaining = lettersRemaining
                //CS 'blanks' = to number of letters in the word that haven't been guessed
                //console.log(chosenLettersArr)
                let blankedChosenLettersArr = []
                function updateBlankOutLetters (chosenLettersArr){
                    for (let i=0; i<chosenLettersArr.length; i++){
                    if (totalTriedLetters.includes(chosenLettersArr[i])) {
                        blankedChosenLettersArr.push(chosenLettersArr[i])
                    };
                    if (!totalTriedLetters.includes(chosenLettersArr[i])){blankedChosenLettersArr.push('_')};
                    }
                }
                updateBlankOutLetters (chosenLettersArr);
                let blankedChosenLetters = blankedChosenLettersArr.join(' ')
                
                //display the State of the game
                function displayState () {
                    console.log (chosenLettersArr);
                    console.log (attemptsRemaining);
                    console.log (triedLettersArr)
                }
                //display the State to the Player
                function displayToPlayer (){
                    console.log ('\nYour word is: ' + blankedChosenLetters);
                    console.log ('Tries Left: ' + attemptsRemaining);
                    console.log (`You've already guessed: ` + totalTriedLetters,'\n');
                }
                
                //Conditions to Exit choosing letters
                    if (totalAttemptsRemaining == 0) {
                        console.log ('\nYou lose!\n')
                        return 'lost'
                    }
                    if (totalLettersRemaining == 0) {
                        console.log ('\nDang you are good!\n')
                        return 'won'
                    }
            
                //Initialization to PLAYER!!!
            displayToPlayer()
            }
            let result2 = pickLetter(prompt('Pick a letter! '))
            return result2
        }
        let result1 = pickLetter ()
        return result1
    }
}

//Tic Tac Toe function creator
function ticTacToeCreator (user) {
    return function (){
        // Define your global variables
        console.log("\nWelcome to tictactoe\n");

        //Define the positions that each player could select
        let availablePositions = [0,1,2,3,4,5,6,7,8];

        // Get player names
        let player1Name = user.name
        let player2Name = 'The stone giant';

        let ticTacToeObj = {
            // Define the board
            // THe numbers are the numbers players can choose
            board:[ 
                "0", "1", "2",  
                "3", "4", "5" , 
                "6", "7", "8"
            ],

            //create a method to process the player moves and to update and returns the tictactoe baord
            playerMove: function (input, position) {
                this.board[position] = input
                console.log(this.board)   
            },

            player1Letter: "x",

            player2Letter: "o",
            
            //create a method to check if a player wins the game
            //There are about 8 scenarios for winning and they are defined below
            gameWin: function () {
                let gameWinner = false;
                let grid = ticTacToeObj.board;

                //This scenario is for the first row
                if ((grid[0] === grid[1]) && (grid[1] === grid[2]) ) {
                    gameWinner = true;
                    if (grid[0] === this.player1Letter) {
                        console.log(`${player1Name} has won the game!\n`);
                        // return 'won'
                        
                    }
                    else if (grid[0] === this.player2Letter) {
                        console.log(`${player2Name} has won the game\n`);
                        // return 'lost'
                    }
                }

                //This scenario is for the second row
                else if ((grid[3] === grid[4]) && (grid[4] === grid[5])) {
                    gameWinner = true;
                    if (grid[3] === this.player1Letter) {
                        console.log(`${player1Name} has won the game!\n`);
                        // return 'won'
                    }
                    else if (grid[3] === this.player2Letter) {
                        console.log(`${player2Name} has won the game\n`);
                        // return 'lost'
                    }
                }

                //This scenario is for the third row
                else if ((grid[6] === grid[7]) && (grid[7] === grid[8])) {
                    gameWinner = true;
                    if (grid[6] === this.player1Letter) {
                        console.log(`${player1Name} has won the game!\n`);
                        // return 'won'
                    }
                    else if (grid[6] === this.player2Letter) {
                        console.log(`${player2Name} has won the game\n`);
                        // return 'lost'
                    }
                }

                //This scenario is for the first column
                else if ((grid[0] === grid[3]) && (grid[3] === grid[6])) {
                    gameWinner = true;
                    if (grid[0] === this.player1Letter) {
                        console.log(`${player1Name} has won the game!\n`);
                        return 'won'
                    }
                    else if (grid[0] === this.player2Letter) {
                        console.log(`${player2Name} has won the game\n`);
                        // return 'lost'
                    }
                }
                
                //This scenario is for the second column
                else if ((grid[1] === grid[4]) && (grid[4] === grid[7])) {
                    gameWinner = true;
                    if (grid[1] === this.player1Letter) {
                        console.log(`${player1Name} has won the game!\n`);
                        // return 'won'
                    }
                    else if (grid[1] === this.player2Letter) {
                        console.log(`${player2Name} has won the game\n`);
                        // return 'lost'
                    }
                }

                //This scenario is for the third column
                else if ((grid[2] === grid[5]) && (grid[5] === grid[8])) {
                    gameWinner = true;
                    if (grid[2] === this.player1Letter) {
                        console.log(`${player1Name} has won the game!\n`);
                        // return 'won'
                    }
                    else if (grid[2] === this.player2Letter) {
                        console.log(`${player2Name} has won the game\n`);
                        // return 'lost'
                    }
                }

                //This scenario is for the first diagonal line going right
                else if ((grid[0] === grid[4]) && (grid[4] === grid[8])) {
                    gameWinner = true;
                    if (grid[0] === this.player1Letter) {
                        console.log(`${player1Name} has won the game!\n`);
                        // return 'won'
                    }
                    else if (grid[0] === this.player2Letter) {
                        console.log(`${player2Name} has won the game\n`);
                        // return 'lost'
                    }
                }

                //This scenario is for the second diagonal line going left
                else if ((grid[2] === grid[4]) && (grid[4] === grid[6])) {
                    gameWinner = true;
                    if (grid[2] === this.player1Letter) {
                        console.log(`${player1Name} has won the game!\n`);
                        //return 'won'
                    }
                    else if (grid[2] === this.player2Letter) {
                        console.log(`${player2Name} has won the game\n`);
                        // return 'lost'
                    }
                }
                return gameWinner;
            },

            //This checks if the game is a tie 
            gameTie: function () {
                let grid = ticTacToeObj.board;
                if ((grid[0] === "x" || grid[0] === "o") && (grid[1] === "x" || grid[1] === "o") 
                && (grid[2] === "x" || grid[2] === "o") && (grid[3] === "x" || grid[3] === "o") 
                && (grid[4] === "x" || grid[4] === "o") && (grid[5] === "x" || grid[5] === "o") 
                && (grid[6] === "x" || grid[6] === "o") && (grid[7] === "x" || grid[7] === "o") 
                && (grid[8] === "x" || grid[8] === "o") ) {
                    return true;
                }
            }
        }

        // Define a function that starts off the game for player 1
        function player1Game () {
            let player1Input = "x";
                let player1Position = prompt(`${player1Name.charAt(0).toUpperCase() + player1Name.slice(1)} please pick a position: `);

                //This makes sure the position is valid, and the array is not already filled with either x or o
                while (!(availablePositions.includes(parseInt(player1Position)) && ticTacToeObj.board[parseInt(player1Position)] !== ticTacToeObj.player1Letter && ticTacToeObj.board[parseInt(player1Position)] !== ticTacToeObj.player2Letter)) {
                    console.log("You have picked an invalid position");
                    player1Position = prompt(`${player1Name.charAt(0).toUpperCase() + player1Name.slice(1)} please pick a position: `);
                }
                // Now pass your arguments and run your tictTacToe playermove object method
                ticTacToeObj.playerMove(player1Input, player1Position);
        }

        function player2Game () {
            let player2Input = "o"
            console.log(`${player2Name} has made it's move`,'')
            let player2Position = Math.floor(Math.random() * 9);
            //This makes sure the position is valid, and the array is not already filled with either x or o
            while (!(availablePositions.includes(parseInt(player2Position)) && ticTacToeObj.board[parseInt(player2Position)] !== ticTacToeObj.player1Letter && ticTacToeObj.board[parseInt(player2Position)] !== ticTacToeObj.player2Letter)) {
                player2Position = Math.floor(Math.random() * 9);
            }
            // Now pass your arguments and run your tictTacToe playermove object method
            ticTacToeObj.playerMove(player2Input, player2Position);
        
        }


        //Define the function that actually plays the tictactoe game
        function ticTacToe () {
            player1Game();
            if (ticTacToeObj.gameWin() === true) {
                //ticTacToeObj.gameWin();
                return 'won'
            }

            else if (ticTacToeObj.gameTie()) {
                console.log("This game is a tie\n");
                return 'lost'
            }
            else {
                player2Game();
                if (ticTacToeObj.gameWin() === true) {
                    //ticTacToeObj.gameWin(); 
                    return 'lost'
                }
                else if (ticTacToeObj.gameTie()) {
                    console.log("This game is a tie\n");
                    return 'lost'
                }
                else {
                    return ticTacToe();
                }
            }  
        }
        console.log(ticTacToeObj.board);
        // Call your function to begin the whole game

        let result  = ticTacToe()
        return result
    }
}