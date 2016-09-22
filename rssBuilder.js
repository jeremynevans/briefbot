var replaceall = require("replaceall");
var feedRead = require("feed-read");
var Feed = require("feed");
var fs = require('fs');
var relevancyFormula = require('./relevancyFormula.js');


var feedList = [
    'http://www.independent.co.uk/news/uk/rss',
    'https://www.theguardian.com/uk/rss',
    'http://www.telegraph.co.uk/news/rss.xml',
    'http://feeds.bbci.co.uk/news/rss.xml?edition=uk',
    'http://www.mirror.co.uk/news/rss.xml',
    'http://blogs.spectator.co.uk/feed/',
    'http://feeds.skynews.com/feeds/rss/home.xml',
    'https://www.buzzfeed.com/world.xml',


    // IMAGES DON'T ALWAYS WORK FOR THESE ONES:

    // 'http://www.theweek.co.uk/feeds/all',
    // 'http://feeds.reuters.com/reuters/UKTopNews',
    // 'http://www.huffingtonpost.co.uk/feeds/verticals/uk-politics/index.xml'
  ];
//
// var keywords = [
//   'brexit',
//   'european union'
// ];
var finalArticles = [];

var feed = new Feed({
    title:       'BriefBot',
    description: 'Brexit, explained',
    link:        'https://briefbot.github.io/',
    image:       'http://example.com/image.png',
    copyright:   'All rights reserved 2016, Explaain',

    author: {
        name:    'BriefBot',
        email:   'johndoe@example.com',
        link:    'https://briefbot.github.io/'
    }
});

var exportFeed = function() {
  sortFeed();
  for (i in finalArticles) {
    article = finalArticles[i];
    console.log('-- ' + article.title + ': ' + article.score);
    feed.addItem({
      title:      article.title,
      link:       article.link,
      content:    article.content,
      date:       article.published
    });
  }
  var rssOutput = feed.render('rss-2.0');
  fs.writeFile('public/rss.xml', rssOutput,  function(err) {
    if (err) {
      return console.error(err);
    }
  });
}

var readFeeds = function(feeds) {
  var feedCount = 0;
  for (i in feeds) {
    var feed = feeds[i];
    feedRead(feed, function(err, articles) {
      if (err) throw err;
      // console.log(articles);
      filterFeed(articles);
      feedCount++;
      if (feedCount >= feeds.length) {
        exportFeed();
      }
    });
  }
};





var cleanText = function(text) {
  text = replaceall("&apos;", "'", text);
  text = replaceall("&#39;", "'", text);
  return text;
}

var cleanArticle = function(article) {
  article.content = cleanText(article.content);
  article.title = cleanText(article.title);
  return article;
}

var addKeyword = function(tags, keyword, inTitle) {
  tags.count++;
  if (inTitle) {
    tags.count++;
  }
  if (tags.list.indexOf(keyword) == -1) {
    tags.list.push(keyword);
  }
  return tags;
};

// var articleRelevant = function(article) {
//   var relevant = false;
//   article.tags = {
//     count: 0,
//     list: []
//   };
//   for (i in keywords) {
//     var keyword = keywords[i];
//     if(article.title.toLowerCase().indexOf(keyword) >= 0) {
//       relevant = true;
//       article.tags = addKeyword(article.tags, keyword, true);
//     }
//     if(article.content.toLowerCase().indexOf(keyword) >= 0) {
//       relevant = true;
//       article.tags = addKeyword(article.tags, keyword, false);
//     }
//   };
//   // if (article.tags.count < 2) {
//   //   relevant = false;
//   // }
//   return relevant;
// };

var filterFeed = function(feed) {
  var newFeed = [];
  for (i in feed) {
    var article = feed[i];
    article = cleanArticle(article);
    article.score = relevancyFormula.calcTotalScore(article);
    if (article.score > 0) {
      finalArticles.push(article);
    };
  };
};

var sortFeed = function() {
  finalArticles.sort(function(a,b){
    return new Date(b.score) - new Date(a.score);
  });
};






readFeeds(feedList);

setInterval(function(){
  readFeeds(feedList);
}, 60 * 60 * 1000);
