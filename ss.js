function rand(max) {
    return Math.floor(Math.random() * max);
}

function shuffle(a) {
    for(let i=a.length - 1; i>0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function chageBrightness(factor, sprite) {
    var virtCanvas = document.createElement("canvas");
    virtCanvas.width = 500;
    virtCanvas.height = 500;
    var context = virtCanvas.getContext("2d");
    context.drawImage(sprite, 0, 0, 500, 500);

    var imgData = context.getImageData(0, 0, 500, 500);

    for(let i=0; i<imgData.data.length; i+=4) {
        imgData.data[i] = imgData.data[i] * factor;
        imgData.data[i+1] = imgData.data[i+1] * factor;
        imgData.data[i+2] = imgData.data[i+2] * factor;
    }
    context.putImageData(imgData, 0, 0);

    var spriteOut = new Image();

    spriteOut.src = virtCanvas.toDataURL();
    virtCanvas.remove();

    return spriteOut;
}

function displayVictoryMoves(moves) {
    document.getElementById("moves").innerHTML = "you moved " + moves + "steps.";
    toggleVisibility("container");
}

function toggleVisibility(id) {
    if(document.getElementById(id).style.visibility == "visible") {
        document.getElementById(id).style.visibility = "hidden";
    }
    else {
        document.getElementById(id).style.visibility = "visible";
    }
}

function Maze(Width, Height) {
    var mazeMap;
    var width = Width;
    var height = Height;
    var startCord, endCord;
    var direction = ["n", "s", "e", "w"];
    var modDir = {
        n: {
            y: -1,
            x: 0,
            o: "s"
        },
        s: {
            y: 1,
            x: 0,
            o: "n"
        },
        e: {
            y: 0,
            x: 0,
            o: "w"
        },
        w: {
            y: 0,
            x: -1, 
            o: "e"
        }
    };
    
    this.map = function() {
        return mazeMap;
    };

    this.startCord = function() {
        return startCord;
    };

    this.endCord = function() {
        return endCord;
    };

    function genMap() {
        mazeMap = new Array(height);
        for(y=0;y<height;y++) {
            mazeMap[y] = new Array(width);
            for(x=0;x<width;x++) {
                mazeMap[y][x] = {
                    n: false,
                    s: false,
                    e: false, 
                    w: false,
                    visited: false,
                    priorPos: null
                };
            }
        }
    }

    function defineMaze() {
        var isComp = false;
        var move = false;
        var cellVisited = 1;
        var numLoops = 0;
        var maxLoops = 0;
        var pos = {
            x: 0,
            y: 0
        };
        var numCells = width * height;
        while(!isComp) {
            move = false;
            mazeMap[pos.x][pos.y].visited = true;

            if(numLoops >=  numCells) {
                shuffle(dirs);
                maxLoops = Math.round(rand(height/8));
                numLoops = 0; 
            }
            numLoops++;
            for(index=0;index<dirs.length;index++) {
                var direction = dirs[index];
                var nx = pos.x + modDir[direction].x;
                var ny = pos.y + modDir[direction].y0;
                // check if the tile is already visited
                if(nx>=0 && nx<width && ny>=0 && ny<height) {
                    // carve through walls from this tile to next
                    if(!mazeMap[nx][ny].visited) {
                        mazeMap[pos.x][pos.y][direction] = true;
                        mazeMap[nx][ny][modDir[direction].o] = true;
                        //set current cell as next cells prior visited
                        mazeMap[nx][ny].priorPos = pos;
                        // update cell position
                        pos = {
                            x: nx,
                            y: ny,
                        };
                        cellVisited++;
                        //recursively call the function on the next tile
                        move = true;
                        break;
                    }
                }
            }
            if(!move) {
                // if it failed to find a direction
                // move the current position back to the prior cell and racall the method
                pos = mazeMap[pos.x][pos.y].priorPos; 
            }

            if(numCells == cellVisited) {
                isComp = true;
            }
        }
    }

    function defineStartEnd() {
        switch(rand(4)) {
            case 0: 
                startCord = {
                    x: 0, 
                    y: 0
                };
                endCord = {
                    x: height - 1, 
                    y: width - 1
                };
                break;
            case 1: 
                startCord = {
                    x: 0, 
                    y: width - 1
                };
                endCord = {
                    x: height - 1, 
                    y: 0
                };
                break;
            case 2:
                startCord = {
                    x: height - 1, 
                    y: 0
                };
                endCord = {
                    x: 0, 
                    y: width - 1
                };
                break;
            case 3:
                startCord = {
                    x: height - 1, 
                    y: width - 1
                };
                endCord = {
                    x: 0, 
                    y: 0
                };
                break;
        }
    }

    genMap();
    defineStartEnd();
    defineMaze();
}

function drawMaze(Maze, ctx, cellsize, endSprite = null) {
    var map = Maze.map();
    var cellSize = cellsize;
    var drawEndMethod;
    ctx.lineWidth = cellSize / 40;
    this.redrawMaze = function(size) {
        cellSize = size;
        ctx.lineWidth = cellSize / 50;
        drawMap();
        drawEndMethod();
    };

    function drawCell(xCord, yCord, cell) {
        var x = xCord * cellSize;
        var y = yCord * cellSize;

        if(cell.n == false) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
            ctx.stroke();
        }
        if(cell.s === false) {
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.stroke();
        }
        if(cell.e === false) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.stroke();
        }
        if(cell.w === false) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
            ctx.stroke();
        }
    }

    function drawMap() {
        for(x=0;x<map.length;x++) {
            for(y=0;y<map[x].length;y++) {
                drawCell(x, y, map[x][y]);
            }
        }
    }

    function drawEndFlag() {
        var cord = Maze.endCord();
        var gridSize = 4;
        var fraction = cellSize / gridSize - 2;
        var colorSwap = true;
        for(let y=0;y<gridSize;y++) {
            if(gridSize % 2 == 0) {
                colorSwap = !colorSwap;
            }
            for(let x=0;x<gridSize;x++) {
                ctx.beginPath();
                ctx.rect(
                    cord.x * cellSize + x * fraction + 4.5,
                    cord.y * cellSize + y * fraction + 4.5,
                    fraction,
                    fraction
                );
                if(colorSwap) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                }
                else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                }
                ctx.fill();
                colorSwap = !colorSwap;
            }
        }
    }

    function drawEndSprite() {
        var offsetLeft = cellSize / 50;
        var offsetRight = cellSize / 25;
        var cord = Maze.endCord();
        ctx.drawImage(
            endSprite,
            2,
            2,
            endSprite.width,
            endSprite.height,
            cord.x * cellSize + offsetLeft,
            cord.y * cellSize + offsetLeft,
            cellSize - offsetRight,
            cellSize - offsetRight
        );  
    }

    function clear() {
        var canvasSize = cellSize * map.length;
        ctx.clearRect(0, 0, canvasSize, canvasSize);
    }

    if(endSprite != null) {
        drawEndMethod = drawEndSprite;
    }
    else {
        drawEndMethod = drawEndFlag;
    }

    clear();
    drawMap();
    drawEndMethod();
}

function Player(maze, c, _cellsize, onComplete, sprite = null) {
    var ctx = c.getContext("2d");
    var drawSprite;
    var moves = 0;
    drawSprite = drawSpriteCircle;
    if(sprite != null) {
        drawSprite = drawSpriteImg;
    }
    var player = this;
    var map = maze.map();
    var cellCords = {
        x: maze.startCord().x,
        y: maze.startCord().y
    };
    var cellSize = _cellsize;
    var halfCellSize = cellSize / 2;
    
    this.redrawPlayer = function(_cellsize) {
        cellSize = _cellsize;
        drawSpriteImg(cellCords);
    };

    function drawSpriteCircle(cord) {
        ctx.beginPath();
        ctx.fillStyle = "yellow";
        ctx.arc(
          (cord.x + 1) * cellSize - halfCellSize,
          (cord.y + 1) * cellSize - halfCellSize,
          halfCellSize - 2,
          0,
          2 * Math.PI
        );
        ctx.fill();
        if (cord.x === maze.endCord().x && cord.y === maze.endCord().y) {
          onComplete(moves);
          player.unbindKeyDown();
        }
    }

    function drawSpriteImg(cord) {
        var offsetLeft = cellSize / 50;
        var offsetRight = cellSize / 25;
        ctx.drawImage(
          sprite,
          0,
          0,
          sprite.width,
          sprite.height,
          cord.x * cellSize + offsetLeft,
          cord.y * cellSize + offsetLeft,
          cellSize - offsetRight,
          cellSize - offsetRight
        );
        if (cord.x === maze.endCord().x && cord.y === maze.endCord().y) {
          onComplete(moves);
          player.unbindKeyDown();
        }
    }

    function removeSprite(cord) {
        var offsetLeft = cellSize / 50;
        var offsetRight = cellSize / 25;
        ctx.clearRect(
          cord.x * cellSize + offsetLeft,
          cord.y * cellSize + offsetLeft,
          cellSize - offsetRight,
          cellSize - offsetRight
        );
    }

    function check(e) {
        var cell = map[cellCords.x][cellCords.y];
        moves++;
        switch (e.keyCode) {
          case 65:
          case 37: // west
            if (cell.w == true) {
              removeSprite(cellCords);
              cellCords = {
                x: cellCords.x - 1,
                y: cellCords.y
              };
              drawSprite(cellCords);
            }
            break;
          case 87:
          case 38: // north
            if (cell.n == true) {
              removeSprite(cellCords);
              cellCords = {
                x: cellCords.x,
                y: cellCords.y - 1
              };
              drawSprite(cellCords);
            }
            break;
          case 68:
          case 39: // east
            if (cell.e == true) {
              removeSprite(cellCords);
              cellCords = {
                x: cellCords.x + 1,
                y: cellCords.y
              };
              drawSprite(cellCords);
            }
            break;
          case 83:
          case 40: // south
            if (cell.s == true) {
              removeSprite(cellCords);
              cellCords = {
                x: cellCords.x,
                y: cellCords.y + 1
              };
              drawSprite(cellCords);
            }
            break;
        }
      }
    
      this.bindKeyDown = function() {
        window.addEventListener("keydown", check, false);
    
        $("#view").swipe({
          swipe: function(
            event,
            direction,
            distance,
            duration,
            fingerCount,
            fingerData
          ) {
            console.log(direction);
            switch (direction) {
              case "up":
                check({
                  keyCode: 38
                });
                break;
              case "down":
                check({
                  keyCode: 40
                });
                break;
              case "left":
                check({
                  keyCode: 37
                });
                break;
              case "right":
                check({
                  keyCode: 39
                });
                break;
            }
          },
          threshold: 0
        });
      };
    
      this.unbindKeyDown = function() {
        window.removeEventListener("keydown", check, false);
        $("#view").swipe("destroy");
      };
    
      drawSprite(maze.startCoord());
    
      this.bindKeyDown();
}

var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var sprite;
var finishSprite;
var maze, draw, player;
var cellSize;
var difficulty;
// sprite.src = 'media/sprite.png';

window.onload = function() {
    let viewWidth = $("#view").width();
    let viewHeight = $("#view").height();
    if (viewHeight < viewWidth) {
      ctx.canvas.width = viewHeight - viewHeight / 100;
      ctx.canvas.height = viewHeight - viewHeight / 100;
    } else {
      ctx.canvas.width = viewWidth - viewWidth / 100;
      ctx.canvas.height = viewWidth - viewWidth / 100;
    }
  
    //Load and edit sprites
    var completeOne = false;
    var completeTwo = false;
    var isComplete = () => {
      if(completeOne === true && completeTwo === true)
         {
           console.log("Runs");
           setTimeout(function(){
             makeMaze();
           }, 500);         
         }
    };
    sprite = new Image();
    sprite.src =
      "/key.png" +
      "?" +
      new Date().getTime();
    sprite.setAttribute("crossOrigin", " ");
    sprite.onload = function() {
      sprite = changeBrightness(1.2, sprite);
      completeOne = true;
      console.log(completeOne);
      isComplete();
    };
  
    finishSprite = new Image();
    finishSprite.src = "/home.png"+
    "?" +
    new Date().getTime();
    finishSprite.setAttribute("crossOrigin", " ");
    finishSprite.onload = function() {
      finishSprite = changeBrightness(1.1, finishSprite);
      completeTwo = true;
      console.log(completeTwo);
      isComplete();
    };
    
  };
  
  window.onresize = function() {
    let viewWidth = $("#view").width();
    let viewHeight = $("#view").height();
    if (viewHeight < viewWidth) {
      ctx.canvas.width = viewHeight - viewHeight / 100;
      ctx.canvas.height = viewHeight - viewHeight / 100;
    } else {
      ctx.canvas.width = viewWidth - viewWidth / 100;
      ctx.canvas.height = viewWidth - viewWidth / 100;
    }
    cellSize = mazeCanvas.width / difficulty;
    if (player != null) {
      draw.redrawMaze(cellSize);
      player.redrawPlayer(cellSize);
    }
  };
  
  function makeMaze() {
    if (player != undefined) {
      player.unbindKeyDown();
      player = null;
    }
    var e = document.getElementById("diffSelect");
    difficulty = e.options[e.selectedIndex].value;
    cellSize = mazeCanvas.width / difficulty;
    maze = new Maze(difficulty, difficulty);
    draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
    player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite);
    if (document.getElementById("mazeContainer").style.opacity < "100") {
      document.getElementById("mazeContainer").style.opacity = "100";
    }
}