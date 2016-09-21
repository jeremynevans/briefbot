var replaceall = require("replaceall");
var feedRead = require("feed-read");
var Feed = require("feed");
var fs = require('fs');

var feedList = [
    'http://www.independent.co.uk/voices/comment/rss',
    'https://www.theguardian.com/us/commentisfree/rss',
    'http://www.telegraph.co.uk/comment/telegraph-view/rss',
    'http://feeds.reuters.com/reuters/UKTopNews',
    // 'http://www.theweek.co.uk/feeds/all',
    'http://feeds.skynews.com/feeds/rss/home.xml',
    'http://www.huffingtonpost.co.uk/feeds/verticals/uk-politics/index.xml'
  ];

var keywords = [
  'brexit',
  'europe',
  'european',
  'european union'
];
var finalArticles = [];

var feed = new Feed({
    title:       'BriefBot',
    description: 'Brexit, explained',
    link:        'https://briefbot.github.io/',
    image:       'http://example.com/image.png',
    copyright:   'All rights reserved 2016, Explaain',
    updated:     new Date(2016, 09, 21),                // optional, default = today

    author: {
        name:    'BriefBot',
        email:   'johndoe@example.com',
        link:    'https://briefbot.github.io/'
    }
});

var exportFeed = function() {
  for (i in finalArticles) {
    article = finalArticles[i];
    feed.addItem({
      title:          article.title,
      link:           article.link,
      description:    article.description
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

var articleRelevant = function(article) {
  var relevant = false;
  article.tags = [];
  for (i in keywords) {
    var keyword = keywords[i];
    if(article.title.toLowerCase().indexOf(keyword) >= 0 || article.content.toLowerCase().indexOf(keyword) >= 0) {
      relevant = true;
      article.tags.push(keyword);
    }
  };
  return relevant;
};

var filterFeed = function(feed) {
  var newFeed = [];
  for (i in feed) {
    var article = feed[i];
    article = cleanArticle(article);
    if (articleRelevant(article)) {
      finalArticles.push(article);
    };
  };
};






readFeeds(feedList);
