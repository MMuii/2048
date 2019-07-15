class Tile {
    constructor(row, col, value, id, reference, cellReference) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.id = id;
        this.reference = reference;
        this.cellReference = cellReference;
    }

    move(direction, lastFreeCell, gameController) {
        if (lastFreeCell === -1) {
            return; 
        } else {
            gameController.tilesMoved++;

            let oldRow = this.row;
            let oldCol = this.col;

            gameController.playfield[oldRow][oldCol].isFree = true;
            gameController.playfield[oldRow][oldCol].tileReference = undefined;
    
            switch (direction) {
                case 'up':
                case 'down':
                    if (lastFreeCell !== -1 && !gameController.playfield[lastFreeCell][this.col].isFree) {
                        //merge
                        $(this.reference).css('transform', `translate(${(tileSize * this.col) + (gridGap * this.col)}px, ${(tileSize * lastFreeCell) + (gridGap * lastFreeCell)}px)`);
                        //setTimeout(() => {
                            gameController.mergeTiles(this, gameController.playfield[lastFreeCell][this.col].tileReference); 
                        //}, 140);
                    } else {
                        this.row = lastFreeCell;
                        gameController.playfield[this.row][this.col].isFree = false;
                        gameController.playfield[this.row][this.col].tileReference = this;
                        $(this.reference).css('transform', `translate(${(tileSize * this.col) + (gridGap * this.col)}px, ${(tileSize * lastFreeCell) + (gridGap * lastFreeCell)}px)`);
                    }
                break;
                case 'right':
                case 'left':
                    if (lastFreeCell !== -1 && !gameController.playfield[this.row][lastFreeCell].isFree) {
                        //merge
                        $(this.reference).css('transform', `translate(${(tileSize * lastFreeCell) + (gridGap * lastFreeCell)}px, ${(tileSize * this.row) + (gridGap * this.row)}px)`);
                        //setTimeout(() => {
                            gameController.mergeTiles(this, gameController.playfield[this.row][lastFreeCell].tileReference);
                        //}, 140);
                    } else {
                        this.col = lastFreeCell;
                        gameController.playfield[this.row][this.col].isFree = false;
                        gameController.playfield[this.row][this.col].tileReference = this;
                        $(this.reference).css('transform', `translate(${(tileSize * lastFreeCell) + (gridGap * lastFreeCell)}px, ${(tileSize * this.row) + (gridGap * this.row)}px)`);
                    }
                break;
            }
        }
    }
}

class Cell {
    constructor(row, col, isFree, reference, tileReference) {
        this.row = row;
        this.col = col;
        this.isFree = isFree;
        this.reference = reference;
        this.tileReference = tileReference;
    }
}

class GameController {
    constructor() {
        this.playfield = [[], [], [], []];
        this.activeTiles = [];
        this.tilesToDelete = [];
        this.tilesMoved = 0;
        this.hasPlayerWon = false;
        this.highestValue = 2;
        this.score = 0;

        this.initPlayfield();
    }

    initPlayfield() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.playfield[i][j] = new Cell(i, j, true, $(`#cell_${i}_${j}`));
            }
        }
    }

    spawnTile(value) {
        idCounter++;

        var tileHTML = `<div class="tile tile--${value}" id="${idCounter}">${value}</div>`
        var position = this.getRandomFreePosition();

        $('.tile_grid').append(tileHTML);

        var tile = new Tile(position.row, position.col, value, idCounter, $(`#${idCounter}`), this.playfield[position.row, position.col].reference);

        $(tile.reference).css('transform', `translate(${(tileSize * position.col) + (gridGap * position.col)}px, ${(tileSize * position.row) + (gridGap * position.row)}px`);

        this.playfield[position.row][position.col].isFree = false;
        this.playfield[position.row][position.col].tileReference = tile;
        this.activeTiles.push(tile);
    }

    spawnTileAtPosition(row, col, value) {
        idCounter++;

        var tileHTML = `<div class="tile tile--${value}" id="${idCounter}">${value}</div>`

        $('.tile_grid').append(tileHTML);

        var tile = new Tile(row, col, value, idCounter, $(`#${idCounter}`), this.playfield[row, col].reference);

        $(tile.reference).css('transform', `translate(${(tileSize * col) + (gridGap * col)}px, ${(tileSize * row) + (gridGap * row)}px`);

        this.playfield[row][col].isFree = false;
        this.playfield[row][col].tileReference = tile;
        this.activeTiles.push(tile);
    }

    getRandomFreePosition() {
        var position;

        do {
            position = {
                row: Math.floor(Math.random() * 4),
                col: Math.floor(Math.random() * 4)
            }
        } while (!this.playfield[position.row][position.col].isFree)

        return position;
    }

    moveTiles(direction) {
        switch (direction) {
            case 'up':
                this.sortActiveTiles('row', 'up');
            break;
            case 'right':
                this.sortActiveTiles('col', 'right');
            break;
            case 'down':
                this.sortActiveTiles('row', 'down');
            break;
            case 'left':
                this.sortActiveTiles('col', 'left');
            break;
        }

        this.activeTiles.forEach(el => {
            el.move(direction, this.findLastFreeCell(el, direction), this);
        });

        this.emptyTilesToDeleteArray();
        
        if (this.checkForLose()) {
            this.endGame('lose');
        }
    }

    findLastFreeCell(tile, direction) {
        let lastFreeCell = -1;
        let foundFreeCell = false;

        switch (direction) {
            case 'up':
                if (tile.row === 0) {
                    return -1;
                } else {
                    lastFreeCell = this.lookForMerge(tile, direction);
                    //console.log(`last free cell up: ${lastFreeCell}`);
                    if (lastFreeCell !== -1) {
                        //merge
                        return lastFreeCell;
                    } else {
                        for (let i = 0; i < tile.row; i++) {
                            if (this.playfield[i][tile.col].isFree) {
                                return i;
                            } else if (!foundFreeCell && i === tile.row - 1) {
                                return -1;
                            }
                        }
                    }
                }
            break;
            case 'right':
                if (tile.col === 3) {
                    return -1;
                } else {
                    lastFreeCell = this.lookForMerge(tile, direction);
                    //console.log(`last free cell right: ${lastFreeCell}`);
                    if (lastFreeCell !== -1) {
                        //merge
                        return lastFreeCell;
                    } else {
                        for (let i = 3; i > tile.col; i--) {
                            if (this.playfield[tile.row][i].isFree) {
                                return i;
                            } else if (!foundFreeCell && i === tile.col + 1) {
                                return -1;
                            }
                        }
                    }
                }
            break;
            case 'down':
                if (tile.row === 3) {
                    return -1;
                } else {
                    lastFreeCell = this.lookForMerge(tile, direction);
                    //console.log(`last free cell down: ${lastFreeCell}`);
                    if (lastFreeCell !== -1) {
                        //merge
                        return lastFreeCell;
                    } else {
                        for (let i = 3; i > tile.row; i--) {
                            if (this.playfield[i][tile.col].isFree) {
                                return i;
                            } else if (!foundFreeCell && i === tile.row + 1) {
                                return -1;
                            }
                        }
                    }
                }
            break;
            case 'left':
                if (tile.col === 0) {
                    return -1;
                } else {
                    lastFreeCell = this.lookForMerge(tile, direction);
                    //console.log(`last free cell left: ${lastFreeCell}`);
                    if (lastFreeCell !== -1) {
                        //merge
                        return lastFreeCell;
                    } else {
                        for (let i = 0; i < tile.col; i++) {
                            if (this.playfield[tile.row][i].isFree) {
                                return i;
                            } else if (!foundFreeCell && i === tile.col - 1) {
                                return -1;
                            }
                        }
                    }
                }
            break;
        }

        // switch (direction) {
        //     case 'up':
        //         if (tile.row === 0) {
        //             return 0;
        //         } else {
        //             lastFreeCell = this.lookForMerge(tile, direction);
        //             //console.log(`last free cell up: ${lastFreeCell}`);
        //             if (lastFreeCell !== -1) {
        //                 //merge
        //                 return lastFreeCell;
        //             } else {
        //                 for (let i = 0; i < tile.row; i++) {
        //                     if (this.playfield[i][tile.col].isFree) {
        //                         return i;
        //                     } else if (!foundFreeCell && i === tile.row - 1) {
        //                         return tile.row;
        //                     }
        //                 }
        //             }
        //         }
        //     break;
        //     case 'right':
        //         if (tile.col === 3) {
        //             return 3;
        //         } else {
        //             lastFreeCell = this.lookForMerge(tile, direction);
        //             //console.log(`last free cell right: ${lastFreeCell}`);
        //             if (lastFreeCell !== -1) {
        //                 //merge
        //                 return lastFreeCell;
        //             } else {
        //                 for (let i = 3; i > tile.col; i--) {
        //                     if (this.playfield[tile.row][i].isFree) {
        //                         return i;
        //                     } else if (!foundFreeCell && i === tile.col + 1) {
        //                         return tile.col;
        //                     }
        //                 }
        //             }
        //         }
        //     break;
        //     case 'down':
        //         if (tile.row === 3) {
        //             return 3;
        //         } else {
        //             lastFreeCell = this.lookForMerge(tile, direction);
        //             //console.log(`last free cell down: ${lastFreeCell}`);
        //             if (lastFreeCell !== -1) {
        //                 //merge
        //                 return lastFreeCell;
        //             } else {
        //                 for (let i = 3; i > tile.row; i--) {
        //                     if (this.playfield[i][tile.col].isFree) {
        //                         return i;
        //                     } else if (!foundFreeCell && i === tile.row + 1) {
        //                         return tile.row;
        //                     }
        //                 }
        //             }
        //         }
        //     break;
        //     case 'left':
        //         if (tile.col === 0) {
        //             return 0;
        //         } else {
        //             lastFreeCell = this.lookForMerge(tile, direction);
        //             //console.log(`last free cell left: ${lastFreeCell}`);
        //             if (lastFreeCell !== -1) {
        //                 //merge
        //                 return lastFreeCell;
        //             } else {
        //                 for (let i = 0; i < tile.col; i++) {
        //                     if (this.playfield[tile.row][i].isFree) {
        //                         return i;
        //                     } else if (!foundFreeCell && i === tile.col - 1) {
        //                         return tile.col;
        //                     }
        //                 }
        //             }
        //         }
        //     break;
        // }
    }

    lookForMerge(tile, direction) {
        let mergeCell = -1;

        switch (direction) {
            case 'up':
                for (let i = 0; i < tile.row; i++) {
                    if (!this.playfield[i][tile.col].isFree && this.playfield[i][tile.col].tileReference.value === tile.value) {
                        mergeCell = i;
                        // console.log('gitara jest merge');
                        continue;
                    } else if (!this.playfield[i][tile.col].isFree && this.playfield[i][tile.col].tileReference.value !== tile.value) {
                        mergeCell = -1;
                        // console.log('huj cos jest pomiedzy');
                    }
                }
            break;
            case 'right':
                for (let i = 3; i > tile.col; i--) {
                    if (!this.playfield[tile.row][i].isFree && this.playfield[tile.row][i].tileReference.value === tile.value) {
                        mergeCell = i;
                        // console.log('gitara jest merge');
                        continue;
                    } else if (!this.playfield[tile.row][i].isFree && this.playfield[tile.row][i].tileReference.value !== tile.value) {
                        mergeCell = -1;
                        // console.log('huj cos jest pomiedzy');
                    }
                }
            break;
            case 'down':
                for (let i = 3; i > tile.row; i--) {
                    if (!this.playfield[i][tile.col].isFree && this.playfield[i][tile.col].tileReference.value === tile.value) {
                        mergeCell = i;
                        // console.log('gitara jest merge');
                        continue;
                    } else if (!this.playfield[i][tile.col].isFree && this.playfield[i][tile.col].tileReference.value !== tile.value) {
                        mergeCell = -1;
                        // console.log('huj cos jest pomiedzy');
                    }
                }
            break;
            case 'left':
                for (let i = 0; i < tile.col; i++) {
                    if (!this.playfield[tile.row][i].isFree && this.playfield[tile.row][i].tileReference.value === tile.value) {
                        mergeCell = i;
                        // console.log('gitara jest merge');
                        continue;
                    } else if (!this.playfield[tile.row][i].isFree && this.playfield[tile.row][i].tileReference.value !== tile.value) {
                        mergeCell = -1;
                        // console.log('huj cos jest pomiedzy');
                    }
                }
            break;
        }

        return mergeCell;
    }

    sortActiveTiles(key, direction) {
        this.activeTiles = this.activeTiles.sort(function(a, b){
            var x = a[key];
            var y = b[key];
    
            switch (direction) {
                case 'down':
                    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                case 'up':
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                case 'left':
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                case 'right':
                    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            }
        });

        //console.log(this.activeTiles);
    }

    findTileIndex(tile) {
        for (let i = 0; i < this.activeTiles.length; i++) {
            if (this.activeTiles[i].id === tile.id) {
                return i;
            }
        }
    }

    emptyTilesToDeleteArray() {
        this.tilesToDelete.forEach(el => {
            this.activeTiles.splice(this.findTileIndex(el), 1);
        });

        this.tilesToDelete = [];
    }

    deleteTile(tile) {
        this.playfield[tile.row][tile.col].isFree = true;
        this.playfield[tile.row][tile.col].tileReference = undefined;
        
        this.tilesToDelete.push(tile);

        setTimeout(() => {
            $(tile.reference).remove();        
        }, 120);
    }

    mergeTiles(old1, old2) {
        let newRow = old2.row;
        let newCol = old2.col;
        let newValue = old2.value * 2;
        
        this.score += newValue;
        $('.score_number').text(`${this.score}`);

        if (newValue > this.highestValue) {
            this.highestValue = newValue;
        }

        if (this.highestValue >= 2048) {
            this.endGame('win');
        }

        this.deleteTile(old1);
        this.deleteTile(old2);

        this.spawnTileAtPosition(newRow, newCol, newValue);
    }

    endGame(winOrLose) {
        if (winOrLose === 'win') {
            if (!this.hasPlayerWon) {
                this.hasPlayerWon = true;
    
                $('.winscreen').css('display', 'grid');
            }
        } else if (winOrLose === 'lose') {
            $('.losescreen').css('display', 'grid');
        }

    }

    restartGame() {
        this.hasPlayerWon = false;
        this.initPlayfield();
        this.tilesToDelete = [];
        this.highestValue = 2;
        this.tilesMoved = 0;
        this.score = 0;

        $('.score_number').text(`${this.score}`);

        this.activeTiles.forEach(tile => {
            $(tile.reference).remove();
        });

        this.activeTiles = [];

        this.spawnTile(2);
    }

    checkForLose() {
        if (this.activeTiles.length >= 16) {
            const directions = ['up', 'right', 'down', 'left'];

            for (let i = 0; i < this.activeTiles.length; i++) {

                for (let j = 0; j < directions.length; j++) {
                    if (this.lookForMerge(this.activeTiles[i], directions[j]) !== -1) {
                        return false;
                    } else {
                        continue;
                    }
                }
            }
            return true;

        } else {
            return false;
        }
    }
}

var idCounter = 0;
var canMove = true;

var tileSize = 117.5;
var gridGap = 10;

$(document).ready(function () {
    var gameController = new GameController();

    gameController.spawnTile(2);

    $(document).keydown(function(e) {
        if (canMove) {
            switch(e.which) {
                case 37: // left
                gameController.moveTiles('left');
                break;
        
                case 38: // up
                gameController.moveTiles('up');
                break;
        
                case 39: // right
                gameController.moveTiles('right');
                break;
        
                case 40: // down
                gameController.moveTiles('down');
                break;

                default: return; 
            }
            e.preventDefault(); 
            canMove = false;

            setTimeout(() => {
                canMove = true;
                if (gameController.tilesMoved > 0) {
                    let randomNum = Math.random();
                    console.log(randomNum);
                    if (randomNum < .8) {
                        gameController.spawnTile(2);
                    } else {
                        gameController.spawnTile(4);
                    }

                    gameController.tilesMoved = 0;
                }
            }, 200);
        }
    });

    $('.restart').on('click', function () {
        gameController.restartGame();
    });

    $('.playAgainWin').on('click', function () {
        gameController.restartGame();
        $('.winscreen').css('display', 'none');
    });

    $('.continue').on('click', function() {
        $('.winscreen').css('display', 'none');
    });

    $('.playAgainLose').on('click', function() {
        gameController.restartGame();
        $('.losescreen').css('display', 'none');
    });
});