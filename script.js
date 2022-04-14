// OBJECTS

// OPTIONS
const Options = (() => {
    const playWithComputerCheckbox = document.getElementById('playWithComputer');
    let playWithComputer = !!playWithComputerCheckbox.checked;
    playWithComputerCheckbox.addEventListener('change', e => playWithComputer = e.target.checked)
    
    // X is chosen by default
    let userMarker = 'x';
    let computerMarker = 'o';
    const userMarkerRadios = Array.from(document.querySelectorAll('input[name="user-marker"]'));

    // User selects X or O
    // when changed, assign checked to marker, then assign opposite to computer marker
    const setMarker = () => {
        userMarker = userMarkerRadios.find(a => a.checked).value;
        // Computer is set to opposite marker
        computerMarker = userMarker == 'o' ? 'x' : 'o';
        if (userMarker == 'o' && playWithComputer) {
            lockIn();
            Gameboard.playTurn(Computer.computerTurn(), Options.computerMarker);
        }
    }

    // Add event listener to both radio btns
    userMarkerRadios.forEach(a => a.addEventListener('change', setMarker));

    // If user chose O, options are locked in until game restart
    const lockIn = () => {
        userMarkerRadios.forEach(a => a.disabled = true);
    }

    const isComputerTurn = () => {
        if (Gameboard.getXPlaying()) {
            return computerMarker == 'x';
        }
        return computerMarker == 'o'; 
    }

    return { userMarker, isComputerTurn, playWithComputer, computerMarker };
})();

// Gameboard
const Gameboard = (() => {
    // let board = [
    //     'x','x','o',
    //     'o','x','x',
    //     'x','o','o',
    // ]; 
    // Testing board

    let board = Array(9).fill(null);
    const getBoard = () => board;

    let xPlaying = true;
    const getXPlaying = () => xPlaying;

    const score = (() => {
        x = 0;
        o = 0;
        xWin = () => this.x += 1;
        oWin = () => this.o += 1;
        getX = () => this.x;
        getO = () => this.o;
        return { xWin, oWin, getX, getO };
    })();
    const getScore = () => `x:${score.getX()} o:${score.getO()}`; // Test

    const markSlot = (slot, marker) => board[slot] = marker;

    const turnLabel = document.getElementById('turnLabel');
    const checkForWin = marker => {
        if (winState()) {
            if (winState() != 'draw') {
                turnLabel.textContent = `${marker} wins!`;
            } else {
                turnLabel.textContent = `It's a draw!`;
            }
        }
        return winState();
    }
    
    const playTurn = (slot, marker) => {
        markSlot(slot, marker);
        switchTurn();
        // checkForWin(marker);
        if (!checkForWin(marker)) turnLabel.textContent = `${marker == 'x' ? 'o' : 'x'}'s turn`
        showBoard();
        return;
    }

    const playRound = slot => {
        const Marker = (() => {
            check = () => xPlaying ? 'x' : 'o';
            let marker = check();
            return { marker, check };
        })();

        playTurn(slot, Marker.marker);        

        // Check if playing with computer
        if (Options.playWithComputer) {
            // Check if it's computer's turn
            if (Options.isComputerTurn()) {
                // Make sure computer doesn't play after a win
                if (checkForWin(Marker.marker)) return;
                setTimeout(() => {
                    playTurn(Computer.computerTurn(), Options.computerMarker);
                }, 1000);
            }
        }
    }

    const winState = () => {
        // Create array of winning indices
        const winners = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]

        // go through board
        // for each index, if all have same marker, return true
        let isWin = winners.some(winner => {
            if (!board[winner[0]] || !board[winner[1]] || !board[winner[2]]) return false;
            return board[winner[0]] == board[winner[1]] && board[winner[1]] == board[winner[2]]
        })
        if (isWin) return isWin;
        if (board.every(a => a)) return 'draw';
    }

    const switchTurn = () => {
        xPlaying = !xPlaying;
        // Change hover marker to current player's marker
        document.documentElement.style.setProperty('--current-player', xPlaying ? `'⨉'` : `'◯'`);
    }

    const showBoard = () => {
        const main = document.querySelector('.gameboard');
        main.innerHTML = '';
        for (let i = 0; i < board.length; i++) {
            const slot = document.createElement('div');
            main.appendChild(slot);
            slot.classList.add('slot');
            slot.dataset.id = i;
            slot.dataset.marker = board[i];
            // Make board unclickable on filled slots, after a win, and during computer's turn
            if (!board[i] && !winState() && !Options.isComputerTurn()) {
                slot.addEventListener(
                    'click',
                    playRound.bind(slot, i)
                );
                slot.style.cursor = 'pointer';
            }
        }
    }

    return { getBoard, showBoard, playRound, playTurn, getScore, getXPlaying, markSlot, switchTurn };
})();

Gameboard.showBoard();




// Players can either play against person or computer
// PERSON ---------
// X goes first
// game plays out

// COMPUTER -------
const Computer = (() => {

    // COMPUTER LOGIC
    const computerTurn = () => {
        const board = Gameboard.getBoard();
        // create new array
        const emptySlots = [];
        // search board array for empty slots
        for (let i = 0; i < board.length; i++) {
            if (!board[i]) emptySlots.push(i);
        }
        // select random index from array
        return emptySlots[(Math.floor(Math.random() * emptySlots.length))];
    }

    return { computerTurn };

})();

// on win or draw, board is unclickable
// winner is added to score board
// new game button clears board array, unlocks marker buttons

//TO DO
// Enable playing against computer
// program new game button
// Style page better
// Maybe fix page layout?
// Add rules (inc. x goes first)
// Add animations
// Line through winning play OR winning match lights up
// markers
// winner
// Keep score
// Add reset score button
// create x wins and o wins variables in game board