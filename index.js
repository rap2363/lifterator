(function() {
  document.getElementById('recordInputForm').addEventListener('submit', saveRecord);
  document.getElementById('calculatePerformanceForm').addEventListener('submit', calculatePerformanceCurve);
})();

function calculatePerformanceCurve(e) {
  var weights = calculateOptimalWeights();
  if (!weights.valid) {
    alert("You need to submit more PR's with various dates to calculate a performance curve!");
  } else {
    createChart(weights);
  }

  e.preventDefault();
}

function createChart(weights) {
  var oneRepMax = weights.w0;
  var alpha = weights.alpha;

  var data = [];
  for (var r = 1; r <= 10; r++) {
    data.push(oneRepMax * math.exp(-alpha * (r - 1)));
  }

  d3.select(".chart")
    .selectAll("div")
    .data(data)
      .enter()
      .append("div")
      .style("width", function(d) { return d + "px"; })
      .text(function(d) { return d; });
}

function saveRecord(e) {
  var issueId = chance.guid();
  var weightInKg = document.getElementById('weightInput').value;
  var daysAgo = document.getElementById('daysAgo').value;
  var reps = document.getElementById('repInput').value;
  var record = {
    id: issueId,
    reps: reps,
    weightInKg: weightInKg,
    daysAgo: daysAgo
  };

  var storageRecords = sessionStorage.getItem('records');
  var records = storageRecords === null
    ? []
    : JSON.parse(storageRecords);

  records.push(record);
  sessionStorage.setItem('records', JSON.stringify(records));

  document.getElementById('recordInputForm').reset();

  fetchRecords();

  e.preventDefault();
}

function fetchRecords() {
  var records = JSON.parse(sessionStorage.getItem('records'));
  var recordsList = document.getElementById('recordsList');

  recordsList.innerHTML = '';

  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var id = record.id;
    var weightInKg = record.weightInKg;
    var daysAgo = record.daysAgo;
    var reps = record.reps;

    recordsList.innerHTML +=   '<div class="well">'+
                              '<h6>Weight (kg): ' + weightInKg + ' kg</h6>'+
                              '<h6>Days Ago: ' + daysAgo + '</h6>'+
                              '<h6>Number of reps: ' + reps + '</h6>'+
                              '</div>';
  }
}

/**
Return the (W0, alpha, gamma) values for the regression given the current list
of records.
*/
function calculateOptimalWeights() {
  var records = JSON.parse(sessionStorage.getItem('records'));
  var vecB = calculateBVector(records);
  var matA = calculateAMatrix(records);
  var transposeMatA = math.transpose(matA);
  var squareMatA = math.multiply(transposeMatA, matA);

  if (math.det(squareMatA) == 0) {
    return {
      w0: 0,
      alpha: 0,
      gamma: 0,
      valid: false
    }
  }

  var optimalWeights = math.multiply(math.inv(squareMatA), math.multiply(transposeMatA, vecB));

  // This is a hacky way to get the data, but I don't know how else to get these
  // values
  return {
    w0: math.exp(optimalWeights._data[0]),
    alpha: optimalWeights._data[1],
    gamma: optimalWeights._data[2],
    valid: true
  };
}

function calculateBVector(records) {
  return math.matrix(records.map(function (record) {
    return [math.log(parseFloat(record.weightInKg))]
  }));
}

function calculateAMatrix(records) {
  return math.matrix(records.map(function (record) {
    return [1, 1 - parseFloat(record.reps), -record.daysAgo]
  }));
}
