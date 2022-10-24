const body = document.querySelector("body");
let sizeOfRow = 4;
let sizeOfField = sizeOfRow * sizeOfRow;
let step = 100 / sizeOfRow;
let numbers = [];

let globalIsGameStop = false;
let globalIsGameEnd = false;
let globalSeconds = 0;
let globalMoves = 0;
let globalInterval = null;

body.insertAdjacentHTML("afterbegin", createUI(sizeOfRow));

const playField = body.querySelector(".play-field");
const timer = body.querySelector(".timer");
const stopBtn = body.querySelector(".stop-btn");
const moveCount = body.querySelector(".move-count");
const burger = document.querySelector(".burger-menu");
const menu = document.querySelector(".button-bar");
const startBtn = document.querySelector(".start-btn");
const paused = document.querySelector(".paused");

function setNumbers (numbers, sizeOfField) {
    numbers.length = 0;
    for (let i = 1; i < sizeOfField; i++) {
        numbers.push(i);
    }
    return numbers;
};

function getTilesObj(numbers) {
    const obj = {};

    for(let i = 0; i < numbers.length; i++) {
        obj[numbers[i]] = {
            id: numbers[i],
            x: null,
            y: null,
            element: null
        }
    }

    return obj;
}

function shuffle(length) {
    const result = [];
  
    while (result.length < length) {
      const number = Math.floor(Math.random() * length);
  
      if (!result.includes(number)) {
        result.push(number);
      }
    }
    
    return result;
  }
  
function shuffleArray(array) {
      const shuffledIndexes = shuffle(array.length);
      return shuffledIndexes.map(index => array[index]);
  }

function shuffleNumbers (numbers) {
    // let length = numbers.length;
    numbers = shuffleArray(numbers);
    return numbers;
};

function getGameField(numbers, sizeOfRow) {
    // const shiftNumbers = numbers.unshift(null);
    const result = [];

    for(let i = 0; i < sizeOfRow; i++) {
        result.push([]);

        for(let j = 0; j < sizeOfRow; j++) {
            if (i === 0 && j === 0) {
                result[i][j] = null;
                continue;
            }

            result[i][j] = numbers[i*sizeOfRow + j];
        }
    }

    return result
}

function createUI (sizeOfRow){
    return`
    <div class="burger-menu">Menu</div>
    <div class="button-bar">
        <div class="button stop-btn">Stop</div>
        <div class="button">Result</div>
        <div class="button start-btn">Shuffle and start</div>
        <div class="button">Save</div>
        <div class="button sound-on"></div>
    </div>
    <div class="result-bar">
        <div class="result-bar-text">Moves:</div>
        <div class="result-bar-numbers move-count">0</div>
        <div class="result-bar-text">Time:</div>
        <div class="result-bar-numbers timer">0</div>
    </div>
    <div class="play-wrapper">
        <div class="play-field"></div>
        <div class="paused">Paused</div>
    </div>
    <div class="current-size">Frame-size:${sizeOfRow}x${sizeOfRow}</div>
    <div class="other-sizes">Available sizes:
        <div class="size-option three">3x3</div>
        <div class="size-option four">4x4</div>
        <div class="size-option five">5x5</div>
        <div class="size-option eight">8x8</div>
    </div>`
};

function createTile(id) {
    const tile = document.createElement('div');
    tile.classList.add("tile")
    tile.style.width = `${step}%`;
    tile.style.height = `${step}%`;
    tile.textContent = id;
    tile.dataset.id = id;
    return tile;
}

function proccessTilesObjects(field, tilesObj) {
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field.length; j++) {
            if (field[i][j] === null) {
                continue;
            }

            const tileIndex = field[i][j];
            const tile = tilesObj[tileIndex];
            tile.x = j;
            tile.y = i;
            tile.element = createTile(tileIndex);
            tile.element.style.top = `${tile.y * step}%`;
            tile.element.style.left = `${tile.x * step}%`;
        }
    }

}

// function createPlayField (numbers, sizeOfField) {
//     for (let i=0; i<sizeOfField; i++) {
//         return`<div class="tile"></div>`};
// };

function renderGame(fieldElement, gameArray, gameTiles) {
    for (let i = 0; i < gameArray.length; i++) {
        for (let j = 0; j < gameArray.length; j++) {
            if (gameArray[i][j] === null) {
                continue;
            }

            const tileElement = gameTiles[gameArray[i][j]];
            fieldElement.append(tileElement.element);
        }
    }
}

function updateTilePosition(tile) {
    tile.element.style.top = `${tile.y * step}%`;
    tile.element.style.left = `${tile.x * step}%`;
}

function creatTileHandler(gameTiles, gameArray, movesElement) {
    movesElement.textContent = globalMoves;

    return function(event) {
        if (globalIsGameStop || globalIsGameEnd) {
            return;
        }

        const tile = gameTiles[event.target.dataset.id];

        const isEmptyLeft = tile.x > 0 && gameArray[tile.y][tile.x - 1] === null;
        const isEmptyRight = tile.x < sizeOfRow - 1 && gameArray[tile.y][tile.x + 1] === null;
        const isEmptyTop = tile.y > 0 && gameArray[tile.y - 1][tile.x] === null;
        const isEmptyBottom = tile.y < sizeOfRow - 1 && gameArray[tile.y + 1][tile.x] === null;

        if (isEmptyLeft) {
            gameArray[tile.y][tile.x] = null;
            gameArray[tile.y][tile.x - 1] = tile.id;
            tile.x = tile.x - 1;
        }
        if (isEmptyRight) {
            gameArray[tile.y][tile.x] = null;
            gameArray[tile.y][tile.x + 1] = tile.id;
            tile.x = tile.x + 1;
        }
        if (isEmptyTop) {
            gameArray[tile.y][tile.x] = null;
            gameArray[tile.y - 1][tile.x] = tile.id;
            tile.y = tile.y - 1;
        }
        if (isEmptyBottom) {
            gameArray[tile.y][tile.x] = null;
            gameArray[tile.y + 1][tile.x] = tile.id;
            tile.y = tile.y + 1;
        }

        if (isEmptyLeft || isEmptyRight || isEmptyTop || isEmptyBottom) {
            globalMoves += 1;
            movesElement.textContent = globalMoves;
        }
        
        updateTilePosition(tile)
    }
}

function getTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds % 60;

    return `${minutes > 9 ? '' : '0'}${minutes}:${seconds > 9 ? '' : '0'}${restSeconds}`;
}

function startTimer() {
    const timerElement = body.querySelector(".timer");
    timerElement.textContent = getTime(globalSeconds);

    globalInterval = setInterval(() => {
        timerElement.textContent = getTime(globalSeconds += 1);
    }, 1000)
}

function createResultsChecker(gameArray, stopGame) {
    return function() {
        if (globalIsGameEnd) {
            return;
        }

        const flatArray = gameArray.reduce((acc, arr) => [...acc, ...arr], []);
        let isVictory = false;

        if (flatArray[0] === null ||flatArray[flatArray.length - 1] === null) {
            isVictory = true;
            const filteredArray = flatArray.filter(Boolean);

            for (let i = 1; i < filteredArray.length; i++) {
                if (filteredArray[i] - 1 !== filteredArray[i - 1]) {
                    isVictory = false;
                    break;
                }
            }
        }

        if (isVictory) {
            stopGame();
            alert(`Hooray! You solved the puzzle in ${getTime(globalSeconds)} and ${globalMoves} moves!`)
        }
    }
}

function stopGame() {
    
    if (!globalIsGameStop) {
        clearInterval(globalInterval);
        globalIsGameStop = true;
        stopBtn.textContent = "Play";
        stopBtn.classList.add("red");
        paused.style.display="block";
    } else {
        stopBtn.textContent = "Stop";
        stopBtn.classList.remove("red");
        paused.style.display="none";
        globalIsGameStop = false;
        startTimer();
    }
}

function reset() {
    globalIsGameStop = false;    
    globalIsGameEnd = false;
    globalSeconds = 0;
    globalMoves = 0;
    clearInterval(globalInterval);
    
    [...playField.children].forEach(element => {
        element.remove();
    })
    stopBtn.textContent = "Stop"
    stopBtn.removeEventListener("click", stopGame)
}

function init() {
    numbers = setNumbers(numbers, sizeOfField);
    const gameArray = getGameField([null, ...shuffleNumbers(numbers)], sizeOfRow);
    const gameTiles = getTilesObj(numbers);

    proccessTilesObjects(gameArray, gameTiles);
    renderGame(playField, gameArray, gameTiles)

    startTimer();

    const endGame = () => {
        globalIsGameEnd = true;
        clearInterval(globalInterval);
    }

    stopBtn.addEventListener("click", stopGame)

    const tileHandler = creatTileHandler(gameTiles, gameArray, moveCount);
    const checkResults = createResultsChecker(gameArray, endGame);
    
    Object.values(gameTiles).forEach(tile => {
        tile.element.addEventListener('click', (event) => {
            tileHandler(event);
            setTimeout(() => {
                checkResults();
            }, 500)
        })
    })
}



init()

burger.addEventListener("click", () => {
    menu.classList.toggle("visible");
});

startBtn.addEventListener("click", () => {
    reset();
    init();
});

const buttonThree = document.querySelector(".three");
const buttonFour = document.querySelector(".four");
const buttonFive = document.querySelector(".five");
const buttonEight = document.querySelector(".eight");

buttonThree.addEventListener("click", () => {
    sizeOfRow = 3;
    sizeOfField = sizeOfRow*sizeOfRow;
    step = 100 / sizeOfRow;
    reset();
    init();
});

buttonFour.addEventListener("click", () => {
    sizeOfRow = 4;
    sizeOfField = sizeOfRow*sizeOfRow;
    step = 100 / sizeOfRow;
    reset();
    init();
});

buttonFive.addEventListener("click", () => {
    sizeOfRow = 5;
    sizeOfField = sizeOfRow*sizeOfRow;
    step = 100 / sizeOfRow;
    reset();
    init();
});

buttonEight.addEventListener("click", () => {
    sizeOfRow = 8;
    sizeOfField = sizeOfRow*sizeOfRow;
    step = 100 / sizeOfRow;
    reset();
    init();
});

