var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const { WebSocketServer } = require("ws")
var _ = require('lodash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  preflightContinue: false,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const { Server } = require("socket.io");

const io = new Server(3000, { cors: {
  origin:["https://ggoman-front-dhdbtkd.vercel.app", 'http://localhost:5173'] 
} });

const history = [
]
const users = [];
io.on("connection", (socket) => {
  if (socket.recovered) {
    // recovery was successful: socket.id, socket.rooms and socket.data were restored
  } else {
    // new or unrecoverable session
    console.log("connect", socket.id);
    if(socket.data.user_name){
      //유저 네임이 있는 유저가 접속 했을 때
      console.log("rejoin", socket.data.user_name);
      socket.emit("user_rejoin", {
        socket_id : socket.id,
        name : socket.data.user_name
      });
    }
    //유저 리스트 전달
    socket.emit("user_list", users);
  }

  //유저가 떠났을 때
  socket.on('disconnect', ()=>{
    
    const user_name = socket.data.user_name
    if(user_name){
      socket.broadcast.emit('user_leave', {
        user_name: socket.data.user_name
      });
      const index = users.findIndex((user) => user.name === user_name);
      if (index !== -1) {
          const removed_user = users.splice(index, 1)[0]; // Get the removed element
          console.log(`Removed: ${removed_user.name}`);
      } else {
          console.log(`Element "${user_name}" not found in array.`);
      }
    }
    
    
  });
  socket.on("from_clinet", (arg)=>{
    console.log("🚀 ~ file: app.js:46 ~ socket.on ~ arg:", arg)
  })
  //기존 친구가 돌아왔을 때
  socket.on("rejoin", (arg)=>{ 
    console.log("user_rejoin", arg);
    users.push({
      socket_id : socket.id,
      name : arg
    });
    socket.data.user_name = arg;
    socket.broadcast.emit("user_rejoin", {
      socket_id : socket.id,
      name : arg
    });
  })
  //새로운 친구가 들어와서 이름 입력했을 때
  socket.on("name_submit", (arg)=>{ 
    console.log("new_member", arg);
    users.push({
      socket_id : socket.id,
      name : arg
    });
    socket.data.user_name = arg;
    socket.broadcast.emit("new_member", {
      socket_id : socket.id,
      name : arg
    });
  })
  //guess 히스토리 요청
  socket.on("request_history", (today_number)=>{
    console.log("request history");
    const find_result = history.find((data)=>{
      return data.number == today_number;
    })
    if(find_result){
      socket.emit("return_history", find_result);
      console.log("and return history");
    }
  })
  //guess 결과 다른 친구에게 전달
  socket.on("guess_result_to_server", (arg)=>{
    const today_number = arg.number;
    const find_result = history.find((data)=>{
      return data.number == today_number;
    })
    if(!find_result){
      const push_data = {
        number : today_number,
        data : [
          arg
        ]
      }
      history.push(push_data);
    } else {
      find_result.data.push(arg);
    }
    socket.broadcast.emit("guess_result_from_server", arg);
    console.log("🚀 ~ file: app.js:87 ~ socket.on ~ history:", history)
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
