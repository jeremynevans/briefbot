var factors = [
  {
    name: 'recency',
    sourceFunction: getRecency
  }

];

var formula = [
  {
    factor: 'keywordRelevancy',
    operation: 'multiply'
  },
  {
    factor: 'recency',
    operation: 'multiply'
  }
];

var getRecency = function(arcticle) {
  var recency;
  var date = getDate(article);
  var now = Date.now();
  var days = (now - date)/86400000;
  if (days < 1) {
    recency = 10;
  } else {
    recency = 10/days;
  }
  return recency;
}
