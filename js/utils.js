

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


function getTime(startTime) {
  var currTime = Date.now() - startTime;
  var timeWithHours = new Date(currTime).toString().split(' ')[4];
  var newTime = timeWithHours.split(':')[1] + ':' + timeWithHours.split(':')[2];
  return newTime;
}


function getCellIdx(cellId) {
  var location = {};
  var parts = cellId.split('-');
  location.i = +parts[1];
  location.j = +parts[2];
  return location;
}
