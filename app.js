var index = ["OK", "X", "SAMPLE"];
bNextPlayer = false,
  maximumMoves = 5 * 5,
  board = [],
  boardSize = 5,
  requiredLineLength = 5, bJatekVege = false;

var dialogConfig = {
  resizable: false,
  modal: true,
  buttons: {
    "Ok": function() {
      $(this).dialog("close");
    }
  }
};

var lineDirections = [
  [0, 1], //horizontal
  [1, 0], //vertical
  [1, -1], //diagonal 1
  [1, 1] //diagonal 2
];

window.onload = function onInit() {
  initScoreBoard();
  getLocation();
}

function onClickStart(event) {
  bJatekVege = false;
  window.localStorage.lepesSzam = 0;
  event.preventDefault();
  window.localStorage.elsoJatekos = $("#choose").val();
  window.localStorage.masodikJatekos = $("#choose2").val();
  if (!window.localStorage.elsoJatekos || !window.localStorage.masodikJatekos) {
    showMessage("A játékos neveket ne felejtsd el megadni!");
    return;
  }
  window.localStorage.nextPlaxer = true;
  var table = document.getElementById("myTable");
  while (table.rows.length !== 0) {
    table.deleteRow(0);
  }
  $("form")[0].className = "templateSvg";
  $("#kovijatek")[0].classList.remove("templateSvg");

  for (let i = 0; i < 5; i++) {
    var row = table.insertRow(i);
    board.push([]);

    for (let j = 0; j < 5; j++) {
      board[i].push(0);
      let oCell = row.insertCell(j);
      oCell.title = "[" + (i + 1) + "," + (j+1) + "] cella";
      oCell.onclick = selectCell;
      oCell.className = "newCell";
      oCell.appendChild(addSvg(index[2]));
      oCell.i = i;
      oCell.j = j;
    }

  }
  initScoreBoard();
  $("#myTable td").tooltip();
}

function selectCell(event) {
  if(parseInt(window.localStorage.lepesSzam) === 25){
    showMessage("Nincs lehetőség több lépésre!", true);
    return;
  }
  if (bJatekVege) {
    return;
  }
  if (!event.currentTarget.isSelected) {
    window.localStorage.lepesSzam++;
    event.currentTarget.isSelected = true;
    event.currentTarget.removeChild(event.currentTarget.firstElementChild);
    event.currentTarget.appendChild(addSvg(bNextPlayer ? index[0] : index[1]));
    event.currentTarget.className = "usedCell";
    bNextPlayer = !bNextPlayer;
    maximumMoves--;
    board[event.currentTarget.i][event.currentTarget.j] = bNextPlayer ? 1 : 2;
    bJatekVege = checkWin((bNextPlayer ? 1 : 2), [event.currentTarget.i, event.currentTarget.j]);

    if (bJatekVege) {
      finishGame(bNextPlayer ? window.localStorage.elsoJatekos : window.localStorage.masodikJatekos);
    }

  } else {
    $("#dialog p").text("A kijelölt cella foglalt!")
    $("#dialog").dialog(dialogConfig);
  }

}

function finishGame(sPlayer) {
  showMessage("A " + sPlayer + " játékos megnyerte a játszmát!", true);
  $("#dialog").dialog(dialogConfig);
  getLocation();
  updateScoreBoard(sPlayer);
}

function addSvg(sNextPlayer) {
  var svg = $("#" + sNextPlayer)[0].cloneNode(true);
  svg.id = "";
  svg.classList.remove(svg.classList[0]);
  svg.classList.add("svgSymbol");
  return svg;
}

function showMessage(sMessage, bHaveConfig) {
  $("#dialog p").text(sMessage);
  if (bHaveConfig) {
    $("#dialog").dialog(dialogConfig);
  } else {
    $("#dialog").dialog();
  }
}

function updateScoreBoard(sPlayer) {
  var table = document.getElementById("scoreTable"),
    row = table.insertRow(table.rows.length),
    oScoreTable = {},
    oCell = row.insertCell(0);
  oScoreTable.player = sPlayer;
  oCell.innerHTML = sPlayer;

  oCell = row.insertCell(1);

  oCell.innerHTML = window.localStorage.lepesSzam;
  oScoreTable.lepesSzam = window.localStorage.lepesSzam


  oCell = row.insertCell(2);

  oCell.innerHTML = window.localStorage.address;
  oScoreTable.location = window.localStorage.address;

  oCell = row.insertCell(3);

  oCell.innerHTML = new Date();
  oScoreTable.datum = new Date();

  let aScoreTable = window.localStorage.aScoreTable === null ? [] : JSON.parse(window.localStorage.aScoreTable);
  aScoreTable.push(oScoreTable);
  window.localStorage.aScoreTable = JSON.stringify(aScoreTable);
}

function initScoreBoard() {

  var table = document.getElementById("scoreTable");

  while (table.rows.length !== 1) {
    table.deleteRow(1);
  }
  let aScoreTable = JSON.parse(window.localStorage.aScoreTable);
  aScoreTable = aScoreTable ? aScoreTable : [];
  aScoreTable.forEach(element => {

    let row = table.insertRow(table.rows.length);
    let oCell = row.insertCell(0);
    oCell.innerHTML = element.player;

    oCell = row.insertCell(1);
    oCell.innerHTML = element.lepesSzam;

    oCell = row.insertCell(2);
    oCell.innerHTML = element.location;

    oCell = row.insertCell(3);
    oCell.innerHTML = element.datum;

  });
}

function getLocation() {

  $.ajax({
    url: "https://geolocation-db.com/jsonp",
    jsonpCallback: "callback",
    dataType: "jsonp",
    success: function(location) {
      window.localStorage.setItem("country", location.country_name);
      window.localStorage.setItem("state", location.state);
      window.localStorage.setItem("city", location.city);

      window.localStorage.setItem("address", [window.localStorage.country, window.localStorage.state, window.localStorage.city].filter(x => typeof x === 'string' && x.length > 0 && x !== "null").join(","));
    }
  });
}

////////////////////////////////////////
// an empty square is marked with 0
// the players are marked with 1 and 2
// pl is the id of the player: either 1 or 2
// lastMove is an array of size 2, with the coordinates of the last move played, for example: [3, 1]
function checkWin(pl, lastMove) {
  var boolWon = false;
  for (var i = 0; i < lineDirections.length && !boolWon; i++) {
    var shift = lineDirections[i];
    var currentSquare = [lastMove[0] + shift[0], lastMove[1] + shift[1]];
    var lineLength = 1;

    while (lineLength < requiredLineLength && legalSquare(currentSquare) && board[currentSquare[0]][currentSquare[1]] === pl) {
      lineLength++;
      currentSquare[0] += shift[0];
      currentSquare[1] += shift[1];
    }

    currentSquare = [lastMove[0] - shift[0], lastMove[1] - shift[1]];
    while (lineLength < requiredLineLength && legalSquare(currentSquare) && board[currentSquare[0]][currentSquare[1]] === pl) {
      lineLength++;
      currentSquare[0] -= shift[0];
      currentSquare[1] -= shift[1];
    }
    if (lineLength >= requiredLineLength)
      boolWon = true;
  }
  return boolWon;
}

function legalSquare(square) {
  return square[0] < boardSize && square[1] < boardSize && square[0] >= 0 && square[1] >= 0;
}
