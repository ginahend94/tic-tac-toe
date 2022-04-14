// OBJECTS

// OPTIONS
const Options = (() => {
    
    // X is chosen by default
    let userMarker = 'x';
    let computerMarker = 'o';
    const getUserMarker = () => userMarker;
    const getComputerMarker = () => computerMarker;
    const resetMarkers = () => {
        userMarker = 'x';
        computerMarker = 'o';
        document.getElementById('x-button').checked = true;
        document.getElementById('o-button').checked = false;
    }
    const userMarkerRadios = Array.from(document.querySelectorAll('input[name="user-marker"]'));
    
    const playWithComputerCheckbox = document.getElementById('playWithComputer');
    let playWithComputer = !!playWithComputerCheckbox.checked;
    const setPlayWithComputer = e => {
        playWithComputer = e.target.checked;
        userMarkerRadios.forEach(a => a.disabled = !playWithComputer);
    }
    setPlayWithComputer({target:playWithComputerCheckbox});
    playWithComputerCheckbox.addEventListener('change', setPlayWithComputer)
    const getPlayWithComputer = () => playWithComputer;

    // User selects X or O
    // when changed, assign checked to marker, then assign opposite to computer marker
    const setUserMarker = () => {
        userMarker = userMarkerRadios.find(a => a.checked).value;
        // Computer is set to opposite marker
        computerMarker = userMarker == 'o' ? 'x' : 'o';
        if (userMarker == 'o' && getPlayWithComputer()) {
            lockIn();
            setTimeout(() => {
                Gameboard.playTurn(Computer.computerSlot(), getComputerMarker());
            }, 500)
        }
    }

    // Add event listener to both radio btns
    userMarkerRadios.forEach(a => a.addEventListener('change', setUserMarker));

    // If user chose O, options are locked in until game restart
    const lockIn = () => {
        userMarkerRadios.forEach(a => a.disabled = true);
        playWithComputerCheckbox.disabled = true;
        // document.querySelectorAll('input').forEach(a => a.disabled = true);
    }

    const isComputerTurn = () => {
        if (!getPlayWithComputer()) return false;
        if (Gameboard.getXPlaying()) {
            return computerMarker == 'x';
        }
        return computerMarker == 'o';
    }

    const newGameButton = document.querySelector('.new-game');
    const resetGame = () => {
        document.querySelectorAll('input').forEach(a => a.disabled = false);
        resetMarkers();
        Gameboard.reset();
        console.log('game reset');
    }
    newGameButton.addEventListener('click', resetGame);


    return { getUserMarker, getComputerMarker, isComputerTurn, getPlayWithComputer };
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
    const clearBoard = () => board = Array(9).fill(null);


    let xPlaying = true;
    const getXPlaying = () => xPlaying;
    const setXPlaying = (boolean = true) => xPlaying = boolean;

    const score = (() => {
        x = 0;
        o = 0;
        resetScores = () => {
            this.x = 0;
            this.o = 0;
        }
        xWin = () => this.x += 1;
        oWin = () => this.o += 1;
        getX = () => this.x;
        getO = () => this.o;
        return { xWin, oWin, getX, getO, resetScores };
    })();
    const getScore = () => `x:${score.getX()} o:${score.getO()}`; // Test

    const markSlot = (slot, marker) => board[slot] = marker;

    const turnLabel = document.getElementById('turnLabel');
    const setTurnLabel = text => turnLabel.textContent = text;

    const checkForWin = marker => {
        if (winState()) {
            if (winState() != 'draw') {
                //turnLabel.textContent = `${marker} wins!`;
                setTurnLabel(`${marker} wins!`);
            } else {
                // turnLabel.textContent = `It's a draw!`;
                setTurnLabel(`It's a draw!`);
            }
        }
        return winState();
    }

    const playTurn = (slot, marker) => {
        markSlot(slot, marker);
        switchTurn();
        // if (!checkForWin(marker)) turnLabel.textContent = `${marker == 'x' ? 'o' : 'x'}'s turn`
        if (!checkForWin(marker)) setTurnLabel(`${marker == 'x' ? 'o' : 'x'}'s turn`);
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

        // Check if playing with computer and if it's computer's turn
        if (Options.getPlayWithComputer() && Options.isComputerTurn()) {
            // Make sure computer doesn't play after a win
            if (checkForWin(Marker.marker)) return;
            setTimeout(() => {
                playTurn(Computer.computerSlot(), Options.getComputerMarker());
            }, 1000);
        }
    }

    const setHoverMarker = marker => {
        document.documentElement.style.setProperty('--current-player', `'${marker}'`);
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
        setHoverMarker(`${xPlaying ? '⨉' : '◯'}`);
        console.log('changing hover maker')
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

    const reset = () => {
        clearBoard();
        setXPlaying();
        score.resetScores();
        setTurnLabel(`x's turn`);
        setHoverMarker('⨉');
        showBoard();
    }

    return { getBoard, showBoard, playRound, playTurn, getScore, getXPlaying, markSlot, switchTurn, reset };
})();

Gameboard.showBoard();




// Players can either play against person or computer
// X goes first

// COMPUTER -------
const Computer = (() => {

    // COMPUTER LOGIC
    const computerSlot = () => {
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

    return { computerSlot };

})();

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
// X and O different colors (b&w)