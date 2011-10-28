(function() {
  var app, express, indexRender, parseUri, robotsTxt, robotstxturi_default, useragent_default, util;
  express = require('express');
  util = require('util');
  parseUri = require('./parseuri.js');
  robotsTxt = require('../robotstxt/index.coffee');
  robotstxturi_default = 'http://www.google.com/robots.txt';
  useragent_default = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html - fake - a harmless robotstxt checker)";
  app = express.createServer();
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  indexRender = function(res, title, des, msg, robotstxturi, totestA, useragent, txtA) {
    if (title == null) {
      title = 'Robots.Txt Checker';
    }
    if (des == null) {
      des = 'Crawl, parse and test Robots.txt Files';
    }
    return res.render('index.jade', {
      title: title,
      description: des,
      msg: msg,
      robotstxturi: robotstxturi,
      totestA: totestA,
      useragent: useragent,
      txtA: txtA
    });
  };
  app.get('/', function(req, res) {
    var everythingok, msg, preParseTestUrls, robotstxturi, rt, rtl, totestA, txtA, useragent, _ref, _ref2;
    msg = {
      error: [],
      notes: [],
      results: []
    };
    txtA = [];
    robotstxturi = robotstxturi_default;
    totestA = [];
    useragent = useragent_default;
    everythingok = false;
    if (((_ref = req.query) != null ? _ref.robotstxturl : void 0) != null) {
      rt = parseUri(req.query.robotstxturl);
    }
    if (((rt != null ? rt.path : void 0) != null) && rt.path !== '') {
      rtl = rt.path.toLowerCase().trim();
      if (rtl !== '/robots.txt') {
        msg.error.push('given robots.txt url is not a valid robots.txt url (must end in /robots.txt)');
      } else {
        robotstxturi = req.query.robotstxturl.trim();
      }
    } else {
      msg.notes.push('please enter a valid robots.txt URL');
    }
    if (req.query.testurls != null) {
      if (Array.isArray(req.query.testurls)) {
        req.query.testurls = req.query.testurls[0];
      }
      totestA = req.query.testurls.split(/\s/);
      preParseTestUrls = function(xA) {
        var preParseTestUrl, tempA, x, _i, _len;
        preParseTestUrl = function(x) {
          var r, xu;
          x = x.trim();
          if ((x[0] != null) && (x[0] !== '/')) {
            if (x.substr(0, 4) !== 'http') {
              x = ['/', x].join('');
            }
          }
          xu = parseUri(x);
          if ((xu.path != null) && xu.path !== '') {
            if ((xu.query != null) && xu.query !== '') {
              return r = xu.path + '?' + xu.query;
            } else {
              r = xu.path;
              if (x.substr(x.length - 1) === '?') {
                return r = r + '?';
              } else {
                return r;
              }
            }
          } else {
            return null;
          }
        };
        xA = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = xA.length; _i < _len; _i++) {
            x = xA[_i];
            _results.push(preParseTestUrl(x));
          }
          return _results;
        })();
        tempA = [];
        for (_i = 0, _len = xA.length; _i < _len; _i++) {
          x = xA[_i];
          if (x != null) {
            tempA.push(x);
          }
        }
        return tempA;
      };
      totestA = preParseTestUrls(totestA);
      if (totestA.length === 0) {
        msg.notes.push('please enter some test URLs');
      }
    } else {
      msg.notes.push('please enter some test URLs');
    }
    if ((req != null ? (_ref2 = req.query) != null ? _ref2.useragent : void 0 : void 0) != null) {
      useragent = req.query.useragent;
    }
    if (useragent && Array.isArray(useragent)) {
      useragent = useragent[0];
    }
    if (useragent) {
      useragent = useragent.trim();
    }
    if (robotstxturi && totestA.length !== 0) {
      rt = robotsTxt(robotstxturi, useragent);
      rt.on('crawled', function(txt) {
        return txtA = txt.split("\n");
      });
      rt.on('ready', function(gate_keeper) {
        var y;
        msg.results = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = totestA.length; _i < _len; _i++) {
            y = totestA[_i];
            _results.push(gate_keeper.why(y));
          }
          return _results;
        })();
        msg.notes.push("" + msg.results.length + " URLs successfully tested");
        return indexRender(res, 'Robots.Txt Checker', 'a description', msg, robotstxturi, totestA, useragent, txtA);
      });
      return rt.on('error', function(e) {
        msg.error.push(e.toString());
        return indexRender(res, 'Error', 'a description', msg, robotstxturi, totestA, useragent, txtA);
      });
    } else {
      while ((totestA != null ? totestA[0] : void 0) == null) {
        totestA[0] = '/';
      }
      return indexRender(res, 'Robots.Txt Checker', 'a description', msg, robotstxturi, totestA, useragent);
    }
  });
  app.listen(process.env.PORT || 3000);
}).call(this);
