(function() {
  document.getElementById('recordInputForm').addEventListener('submit', saveRecord);
})();

function saveRecord(e) {
  var issueId = chance.guid();
  var reps = document.getElementById('repInput').value;
  var weightInKg = document.getElementById('weightInput').value;
  var record = {
    id: issueId,
    reps: reps,
    weightInKg: weightInKg
  };

  var localStorageRecords = localStorage.getItem('records');
  var records = localStorageRecords === null
    ? []
    : JSON.parse(localStorageRecords);

  records.push(record);
  localStorage.setItem('records', JSON.stringify(records));

  document.getElementById('recordInputForm').reset();

  fetchRecords();
  console.log(calculateWeights());
  e.preventDefault();
}

function fetchRecords() {
  var records = JSON.parse(localStorage.getItem('records'));
  var recordsList = document.getElementById('recordsList');

  recordsList.innerHTML = '';

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var id = record.id;
    var weightInKg = record.weightInKg;
    var reps = record.reps;

    recordsList.innerHTML +=   '<div class="well">'+
                              '<h6>Weight: ' + weightInKg + ' kg</h6>'+
                              '<h6>Reps: ' + reps + '</h6>'+
                              '</div>';
  }
}

/**
Return the (W0, alpha) values for the regression given the current list of
records.
*/
function calculateWeights() {
  var records = JSON.parse(localStorage.getItem('records'));
  var vecB = calculateBVector(records);
  var matA = calculateAMatrix(records);
  var transposeMatA = math.transpose(matA);
  var squareMatA = math.multiply(transposeMatA, matA);

  console.log(vecB);
  console.log(matA);
  console.log(transposeMatA);
  console.log(math.multiply(transposeMatA, vecB));
  console.log(math.inv(squareMatA));

  var optimalWeights = math.multiply(math.inv(squareMatA), math.multiply(transposeMatA, vecB));
  console.log(optimalWeights);
  return [];
  // return {w0: math.exp(optimalWeights.index(0)), alpha: optimalWeights.index(1)};
}

function calculateBVector(records) {
  return math.matrix(records.map(function (record) {
    return [math.log(parseFloat(record.weightInKg))]
  }));
}

function calculateAMatrix(records) {
  return math.matrix(records.map(function (record) {
    return [1, 1 - parseFloat(record.reps)]
  }));
}
