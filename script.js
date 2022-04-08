// OBJECTS
// Gameboard
const Gameboard = (() => {
    // let board = [
    //     'x','x','o',
    //     'o','x','x',
    //     'x','o','o',
    // ];

    //let board = new Array(9);
    let board = Array(9).fill(null);

    let xPlaying = true;

    const playTurn = (slot, marker) => {
        const turnLabel = document.getElementById('turnLabel');
        switchTurn();
        turnLabel.textContent = `${xPlaying ? 'x' : 'o'}'s turn`;
        board[slot] = marker;
        if (winState() && winState() != 'draw') {
            turnLabel.textContent = `${marker} wins!`
        }
        if (winState() == 'draw') {
            turnLabel.textContent = `It's a draw!`;
        }
        showBoard();
    }

    const winState = () => {
        // Create array of winning indices
        const winners = [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [2,4,6]
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
        document.documentElement.style.setProperty('--current-player', xPlaying?`'⨉'`:`'◯'`);
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
            if (!board[i]) {
                slot.addEventListener(
                    'click', 
                    playTurn.bind(slot, i, xPlaying ? 'x' : 'o')
                );
                slot.style.cursor = 'pointer';
            }
        }
    }

    return {showBoard, playTurn};
})();

Gameboard.showBoard();

// User selects X or O
// Computer is set to opposite of what player chooses
// gameboard is displayed on screen
// when player clicks a square, square index is logged in player moves
// computer searches for empty slot and places marker
// comp move is logged
// each move is logged in gameboard
// game searches gameboard for win
// if win condition is met, game ends
// Winner is displayed on screen
// Option to play again is displayed on screen