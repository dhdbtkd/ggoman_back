var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '꼬맨틀 백엔드' });
});

module.exports = router;
