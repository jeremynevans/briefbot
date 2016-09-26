var htmlToText = require('html-to-text');

var formula = [
  {
    name: 'keywords',
    factorFunction: function(a) {
      return getKeywordScore(a);
    },
    operation: 'add'
  },
  {
    name: 'recency',
    factorFunction: function(a) {
      return getRecencyScore(a);
    },
    operation: 'multiply'
  },
  {
    name: 'blacklist',
    factorFunction: function(a) {
      return getBlackListScore(a);
    },
    operation: 'multiply'
  }
];


var keywords = [
  {
    text: 'brexit',
    weight: 12
  },
  {
    text: 'european union',
    weight: 4
  },
  {
    text: 'article 50',
    weight: 4
  },
  {
    text: 'single market',
    weight: 1
  }
];


var keywordBlacklist = [
  
];




var calcTotalScore = function(article) {
  var totalScore = 0;
  for (i in formula) {
    var step = formula[i];
    stepScore = step.factorFunction(article);
    if (i == 3 && stepScore > 0) {
      // console.log(step.name + ': ' + stepScore);
    }
    switch (step.operation) {
      case 'add':
        totalScore += stepScore;
        break;
      case 'multiply':
        totalScore *= stepScore;
        break;
      default:
        totalScore += stepScore;
    }
  }
  // console.log('Total Score: ' + totalScore);
  return totalScore;
}




var getKeywordScore = function(article) {
  score = 1;
  for (i in keywords) {
    var keyword = keywords[i];
    score *= singleKeywordScore(article.title, keyword, true);
    score *= singleKeywordScore(article.content, keyword, false);
  }
  score -= 1;
  return score;
}

var singleKeywordScore = function(text, keyword, title) {
  var score = 1;
  var plainText = htmlToText.fromString(text, {
    ignoreHref: true,
    wordwrap: false
  });
  var index = plainText.toLowerCase().indexOf(keyword.text);
  if (index >= 0) {
    score = 1 + 1*20*keyword.weight/index;
    if (score > 2) {
      score = 2;
    }
    if (title) {
      score *= 2;
    }
  }
  var titleText = title ? ' (title)' : '';
  // if (score>0) {
  //   console.log(keyword);
  //   console.log(text);
  //   console.log(title);
  //   var plainText = htmlToText.fromString(text, {
  //     ignoreHref: true,
  //     wordwrap: false
  //   });
  //   console.log(plainText.indexOf(keyword) + titleText);
  //   // console.log(plainText);
  // }
  // console.log('- keyword "' + keyword + '": ' + score + titleText);
  return score;
}

var getRecencyScore = function(article) {
  var recency;
  var date = getDate(article);
  var now = Date.now();
  var days = (now - date)/86400000;
  if (days < 1) {
    recency = 1.5 - days/2;
  } else {
    recency = 1/days;
  }
  return recency;
}

var getDate = function(article) {
  return article.published;
}


var getBlackListScore = function(article) {
  for (i in keywordBlacklist) {
    var keyword = keywordBlacklist[i];
    if (article.title.toLowerCase().indexOf(keyword) != -1) {
      console.log(article.title);
      return 0;
    }
  }
  return 1;
}




module.exports.calcTotalScore = calcTotalScore;









var testSampleArticles = function() {
  for (i in sampleArticles) {
    var article = sampleArticles[i];
    // console.log(article.title);
    var score = calcTotalScore(article);
  }
}


var sampleArticles = [
  {
    title: 'Oktoberfest: the world\'s largest beer festival – in pictures',
    content: '<p>The 183rd Oktoberfest, taking place in Munich, was first held in 1810 in honour of the Bavarian crown prince Ludwig’s marriage to Princess Therese von Sachsen-Hildburghausen. It is expected to attract more than 6 million visitors</p> <a href="https://www.theguardian.com/world/gallery/2016/sep/20/oktoberfest-the-worlds-largest-beer-festival-in-pictures">',
    published: new Date('Tue Sep 20 2016 12:35:55 GMT+0100 (BST)')
  },
  {
    title: 'Brits in the EU: are you applying for citizenship?',
    content: '<p>If you live or work in an EU country and are applying for citizenship due to the Brexit vote, we want to hear from you<br></p><p>After Britain’s vote to leave the European Union, British citizens living and working across the EU <a href="http://www.theguardian.com/politics/2016/jun/27/leave-vote-prompts-rush-dual-nationality-eu-passports">have been weighing up their futures</a>.<br></p><p> <span>Related: </span><a href="https://www.theguardian.com/politics/2016/sep/13/zero-chance-eu-citizens-keep-same-rights-post-brexit-expert">Zero chance EU citizens in UK will keep same rights post-Brexit, says expert</a> </p> <a href="https://www.theguardian.com/politics/2016/sep/14/brits-in-the-eu-are-you-applying-for-citizenship">',
    published: new Date('Wed Sep 14 2016 09:45:46 GMT+0100 (BST)')
  }
]
