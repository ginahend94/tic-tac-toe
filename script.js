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
    setPlayWithComputer({ target: playWithComputerCheckbox });
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
        //userMarkerRadios.forEach(a => a.disabled = true);
        //playWithComputerCheckbox.disabled = true;
        document.querySelectorAll('input').forEach(a => a.disabled = true);
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
    }
    newGameButton.addEventListener('click', resetGame);


    return { getUserMarker, getComputerMarker, isComputerTurn, getPlayWithComputer };
})();

// Gameboard
const Gameboard = (() => {

    let board = Array(9).fill(null);
    const getBoard = () => board;
    const clearBoard = () => board = Array(9).fill(null);


    let xPlaying = true;
    const getXPlaying = () => xPlaying;
    const setXPlaying = (boolean = true) => xPlaying = boolean;

    const markSlot = (slot, marker) => board[slot] = marker;

    const turnLabel = document.getElementById('turnLabel');
    const setTurnLabel = text => turnLabel.textContent = text;

    const checkForWin = marker => {
        if (winState.check()) {
            if (winState.check() != 'draw') {
                setTurnLabel(`${marker} wins!`);
            } else {
                setTurnLabel(`It's a draw!`);
            }
            setHoverMarker('');
        }
        return winState.check();
    }

    const playTurn = (slot, marker) => {
        markSlot(slot, marker);
        switchTurn();
        if (!checkForWin(marker)) setTurnLabel(`${marker == 'x' ? 'o' : 'x'}'s turn`);
        showBoard();
        return;
    }

    let computerTurn;

    const playRound = slot => {
        let marker = xPlaying ? 'x' : 'o';

        playTurn(slot, marker)

        // Check if playing with computer and if it's computer's turn
        if (Options.getPlayWithComputer() && Options.isComputerTurn()) {
            setHoverMarker('');
            // Make sure computer doesn't play after a win
            if (checkForWin(marker)) return;
            computerTurn = setTimeout(() => {
                playTurn(Computer.computerSlot(), Options.getComputerMarker());
            }, 1000);
        }
    }

    const setHoverMarker = marker => {
        document.documentElement.style.setProperty('--current-player', `'${marker}'`);
        document.documentElement.style.setProperty('--current-player-color', `${marker == 'X' ? 'white' : 'var(--blue)'}`);
    }

    const winState = (() => {
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

        // Create array for spots that won
        let winningSpots = [];
        const setWinningSpots = winner => winner.forEach(a => winningSpots.push(a));
        const resetWinningSpots = () => winningSpots.length = 0;

        // go through board
        // for each index, if all have same marker, return true
        const check = () => {
            let isWin = winners.some(winner => {
                if (!board[winner[0]] || !board[winner[1]] || !board[winner[2]]) return false;
                if (board[winner[0]] == board[winner[1]] && board[winner[1]] == board[winner[2]]) {
                    setWinningSpots(winner);
                    return true;
                }
                return false;
            })
            if (isWin) return isWin;
            if (board.every(a => a)) return 'draw';
        }
        return { check, winningSpots, resetWinningSpots }
    })();

    const switchTurn = () => {
        setXPlaying(!getXPlaying());
        // Change hover marker to current player's marker
        setHoverMarker(`${getXPlaying() ? 'X' : 'O'}`);
    }

    const showBoard = () => {
        const main = document.querySelector('.gameboard');
        main.innerHTML = '';
        for (let i = 0; i < board.length; i++) {
            const slot = document.createElement('div');
            main.appendChild(slot);
            slot.classList.add('slot');
            // show win animation
            if (winState.check() && winState.winningSpots.indexOf(i) >= 0) {
                slot.classList.add('winner');
            }
            slot.dataset.id = i;
            slot.dataset.marker = board[i];
            // Make board unclickable on filled slots, after a win, and during computer's turn
            if (!board[i] && !winState.check() && !Options.isComputerTurn()) {
                slot.addEventListener(
                    'click',
                    playRound.bind(slot, i)
                );
                slot.style.cursor = 'pointer';
            }
        }
    }

    const reset = () => {
        clearTimeout(computerTurn);
        clearBoard();
        setXPlaying();
        winState.resetWinningSpots();
        setTurnLabel(`x's turn`);
        setHoverMarker('X');
        showBoard();
    }

    return { getBoard, showBoard, playRound, playTurn, getXPlaying, markSlot, switchTurn, reset };
})();

Gameboard.showBoard();

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

//TO DO
// Clear timeout for when you reset game before computer plays

//MODAL
const Modal = (() => {
    const modalContainer = document.querySelector('.modal-container');
    const modalBg = document.querySelector('.modal-bg');
    const closeButton = document.querySelector('.close');
    const about = document.getElementById('about');

    const closeModal = () => modalContainer.classList.add('modal-closed');
    const openModal = () => modalContainer.classList.remove('modal-closed');

    modalBg.addEventListener('click', closeModal);
    closeButton.addEventListener('click', closeModal);
    about.addEventListener('click', openModal);
})();