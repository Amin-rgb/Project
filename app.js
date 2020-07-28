var gravity = 8;
var initialForce = 30;
var express = require("express");
var app = express();
var serv = require("http").Server(app);
app.use(express.urlencoded());
app.use(express.json());
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database:"flappy",
  port:3306
});


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  var sql = "SELECT * FROM rooms;";
  con.query(sql, function (err, result) {
    if (err) throw err;
    var i;
    for(i=0;i<result.length;i++)
    {
      rooms.push({
        roomName:result[i].roomsName,
        players: 0,
        maxPlayers: 10,
        gameOver: true,
        playersReady:0 ,
        numberOfId: 0,
        bird: [],
        birdsDead: 0,
        tubesTop: [{ x: 190, y: 0, w: 30, h: 100 }],
        tubesBottom: [{ x: 190, y: 220, w: 30, h: 200 }],
        startTimer: 1000,
        highScore :{first:{name:result[i].highScore_name,score:result[i].highScore},second:{name:result[i].highScore2_name,score:result[i].highScore2},last:{name:result[i].highScore3_name,score:result[i].highScore3}}
      })
    }
  });

});

var rooms = [];

function emitGlobal(roomIndex, msg, name) {
 //console.log(roomIndex + " hello")
  //console.log(msg)
  //console.log(name)
  //console.log(rooms)
  var i;
  for (i = 0; i < rooms[roomIndex].bird.length; i++) {
    io.to(rooms[roomIndex].bird[i].id).emit(name, msg);
  }
}

var playersRooms = {};

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/lobby.html");
});

app.get("/getRooms", function (req, res) {
  //res.sendFile(__dirname + '/client/index.html');
  res.send(rooms);
});

app.get("/joinRoom", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

app.post("/top3Players", function(req,res){
  var i;
  for(i=0;i<rooms.length;i++)
  {

    if(req.body.roomName == rooms[i].roomName)
    {
      res.send(rooms[i].highScore)
    }
  }
})

app.delete("/deleterooms/:name",function(req,res){


    if(rooms[roomNameIndex(req.params.name)].numberOfId == 0)
    {
       rooms.splice(roomNameIndex(req.params.name),1)
       var sql = "delete from rooms where roomsName = ?;"
       con.query(sql,[req.params.name],function (err, result) 
       {

          if (err) throw err;

       });
      res.send("sucess")
    }

    else
    {
     res.status(400)
     res.send('error')
    }
})

app.post("/createRooms",function(req,res){
  
  var i;
  for(i=0;i<rooms.length;i++)
  {
   // console.log(req.body.roomName)
    if(req.body.roomName == rooms[i].roomName)
   {
   // console.log(req.body.roomName)
      res.status(400)
      res.send('error')
   }

   
  }
  rooms.push({
    roomName:req.body.roomName,
    players: 0,
    maxPlayers: 10,
    gameOver: true,
    playersReady: 0,
    numberOfId: 0,
    bird: [],
    birdsDead: 0,
    tubesTop: [{ x: 190, y: 0, w: 30, h: 100 }],
    tubesBottom: [{ x: 190, y: 220, w: 30, h: 200 }],
    startTimer: 1000,
    highScore :{first:{name:"",score:0},second:{name:"",score:0},last:{name:"",score:0}}
  })

//  if(req.body.roomName.indexOf('\'') <=0)
 // {
   // req.body.roomName = "undefined"
  //}
  var sql = "INSERT INTO rooms (`roomsName`, `highScore`) VALUES (?, '0');";
  con.query(sql,req.body.roomName,function (err, result) {

    if (err) throw err;
  });
 // console.log(req.body)
  res.send(req.body.roomName)

 
  })
app.use("/client", express.static(__dirname + "/client"));

serv.listen(3000);
console.log("server started");

var io = require("socket.io")(serv, {});
socketGlobal = io.sockets.on("connection", function (socket) {
  socket.on("disconnect", function () {
    var indexId = rooms[roomIndex(socket.id)];

    console.log("Got disconnect!");

    if (indexId) {
      indexId.numberOfId--;
      indexId.players--
      
     // console.log(indexId)
    }

    var i;
    for (i = 0; i < rooms.length; i++) {
      var j;
      for (j = 0; j < rooms[i].bird.length; j++) {
        if (socket.id == rooms[i].bird[j].id) {
          rooms[i].bird.splice(j, 1);
          //  rooms[I is the index of tyhe ]
          //console.log(console.log(rooms[i].bird.length is  == rooms[i].j).highscore )
          // then I want you to find the high score an dchange it 
        }

        // console.log(rooms[i].bird);
      }
    }
  });

  socket.on("lobby", function (data) {
    playersRooms[socket.id] = data.msg;
    console.log("socket connection");
    rooms[roomIndex(socket.id)].numberOfId++;

    //console.log(playersRooms);
    //console.log(rooms);
    rooms[roomIndex(socket.id)].bird.push({
      x: 0,
      y: 210,
      w: 25,
      h: 25,
      force: initialForce,
      id: socket.id,
      alive: true,
      name: "",
      currentScore:0,
      highestScore:0
    });


    rooms[roomIndex(socket.id)].players++
  });


  // function sameName(name)
  //   {
  //     var i;
  //     for(i=0;i<rooms.length;i++)
  //     {
  //      var j;
  //       for(j=0;j<rooms[i].bird.length;j++)
  //       {
  //         if(rooms[i].bird[j].name == name)
  //        {
  //           var randomNameOg = Math.random()*10000000000000+1
  //          var randomNameNew = Math.round(randomNameOg)

  //          return "player"+randomNameNew;
  //        }
  //       }
    
  //     }
  //     return name;
  //   }
 
  socket.on("Start", function (data) {

      rooms[roomIndex(socket.id)].playersReady++;

    var j;
    for (j = 0; j < rooms.length; j++) 
    {
      var i;
      for (i = 0; i < rooms[j].bird.length; i++) 
      {
        if (socket.id == rooms[j].bird[i].id) {

          rooms[j].bird[i].name = data.username

           // console.log("console")
            rooms[j].tubesTop = [{ x: 210, y: 0, w: 30, h: 100 }];
            rooms[j].tubesBottom = [{ x: 210, y: 230, w: 30, h: 200 }];
            initializeTubes()

          rooms[j].bird[i].x = 40;
          rooms[j].bird[i].y = 210;
          rooms[j].bird[i].alive = true;
          //console.log(rooms[j].bird[i].name);

        }
      
        rooms[j].bird[i].currentScore = 0;
      }
    }
  });

  socket.on("space", function (data) {
    var j;
    for (j = 0; j < rooms.length; j++) {
      var i;
      for (i = 0; i < rooms[j].bird.length; i++) {
        if (rooms[j].bird[i].id == socket.id) {
          rooms[j].bird[i].force = initialForce;

        }
      }
    }
  });
});

initializeTubes();

function initializeTubes() {
  push();
  push();
  push();
  push();
  push();
  push();
  push();
  push();
  push();
  push();
  push();
  push();
  push();
  push();
}

function roomIndex(a) {
  //console.log(playersRooms);
  var i;
  for (i = 0; i < rooms.length; i++) {
    if (playersRooms[a] == rooms[i].roomName) {
      // console.log(i);
      return i;
    }
  }
}

function push() {
  // randomNumber + 80 = $  420-$
  var i;
  for (i = 0; i < rooms.length; i++) {
    var randomNumber = Math.round(Math.random() * 150 + 50);
    rooms[i].tubesTop.push({
      x: rooms[i].tubesTop[rooms[i].tubesTop.length - 1].x + 170,
      y: 0,
      w: 30,
      h: randomNumber,
    });

    var math = Math.random();
    //randomNumber = 238	math = 0.311
    var randomNumberBottom = Math.round(math * (420 - (200 + 120)) + 40);

    var bottomTube = {
      x: rooms[i].tubesBottom[rooms[i].tubesBottom.length - 1].x + 170,
      y: 420 - randomNumberBottom,
      w: 30,
      h: randomNumberBottom,
    };
    //console.log(bottomTube)
    //console.log(rooms[i].tubesBottom.length)

    rooms[i].tubesBottom.push(bottomTube);
  }
}

function updateTubes(roomIndex) {
  var i;
  for (i = 0; i < rooms[roomIndex].tubesTop.length; i++) {
    rooms[roomIndex].tubesTop[i].x = rooms[roomIndex].tubesTop[i].x - 8;
  }

  var i;
  for (i = 0; i < rooms[roomIndex].tubesBottom.length; i++) {
    rooms[roomIndex].tubesBottom[i].x = rooms[roomIndex].tubesBottom[i].x - 8;
  }

  var i;
  for (i = 0; i < rooms[roomIndex].tubesTop.length; i++) {
    if (rooms[roomIndex].tubesTop[i].w + rooms[roomIndex].tubesTop[i].x <= 0) {
      rooms[roomIndex].tubesTop.splice(0, 1);
      push();
    }
  }

  var i;
  for (i = 0; i < rooms[roomIndex].tubesBottom.length; i++) {
    if (
      rooms[roomIndex].tubesBottom[i].w + rooms[roomIndex].tubesBottom[i].x <= 0
    ) {
      rooms[roomIndex].tubesBottom.splice(0, 1);
      push();
    }
  }
}

function GameOver(a, roomIndex) {
  rooms[roomIndex].bird[a].alive = false;
  rooms[roomIndex].birdsDead++;

  if(rooms[roomIndex].birdsDead == rooms[roomIndex].playersReady) {
    rooms[roomIndex].gameOver = true;
    emitGlobal(
      roomIndex,
      {
        gameOver: true,
      },
      "gameOver"

    );
   
    rooms[roomIndex].playersReady = 0;
    console.log("execute")

    rooms[roomIndex].startTimer = 1000;
    rooms[roomIndex].bird[a].alive  = true
    rooms[roomIndex].birdsDead = 0
    }

  if (rooms[roomIndex].numberOfId - rooms[roomIndex].birdsDead == 1 ) {
    for (i = 0; i < rooms[roomIndex].bird.length; i++) {
      if (rooms[roomIndex].bird[i].alive == true) {
        emitGlobal(
          roomIndex,
          {
            BiRdNaMe: rooms[roomIndex].bird[i].name,
          },
          "birdName"
        );
      }
    }
  }
}

function updateBirds(a, z) {
  rooms[z].bird[a].y = rooms[z].bird[a].y - rooms[z].bird[a].force;
  rooms[z].bird[a].force = rooms[z].bird[a].force - gravity;

  if (rooms[z].bird[a].force < -20) {
    rooms[z].bird[a].force = -20;
  }

  if (rooms[z].bird[a].y > 400) {
    GameOver(a, z);
  }

  var i;
  for (i = 0; i < rooms[z].tubesTop.length; i++) {
    if (
      rooms[z].bird[a].x + rooms[z].bird[a].h > rooms[z].tubesTop[i].x &&
      rooms[z].bird[a].y < rooms[z].tubesTop[i].y + rooms[z].tubesTop[i].h &&
      rooms[z].tubesTop[i].w + rooms[z].tubesTop[i].x > rooms[z].bird[a].x
    ) {
      GameOver(a, z);
    }
  }

  var i;
  for (i = 0; i < rooms[z].tubesBottom.length; i++) {
    if (
      rooms[z].bird[a].x + rooms[z].bird[a].w > rooms[z].tubesBottom[i].x &&
      rooms[z].bird[a].y + rooms[z].bird[a].h > rooms[z].tubesBottom[i].y &&
      rooms[z].tubesBottom[i].x + rooms[z].tubesBottom[i].w > rooms[z].bird[a].x
    ) {
      GameOver(a, z);
    }
  }
}


function roomNameIndex(roomName)
{
  var i;
  for(i=0;i<rooms.length;i++)
  {
    if(rooms[i].roomName == roomName)
    {
      return i;
    }
  }
  return -1;
}



var timer = setInterval(function () {
  var i;
  for (i = 0; i < rooms.length; i++) {
    if (
      rooms[i].numberOfId == rooms[i].playersReady &&
      rooms[i].numberOfId != 0
    ) {
      rooms[i].startTimer = rooms[i].startTimer - 100;

      emitGlobal(
        i,
        {
          msg: rooms[i].startTimer,
        },
        "timerTimeLeft"
      );
    }

    if (rooms[i].startTimer == 0) {
      rooms[i].gameOver = false;
      emitGlobal(
        i,
        {
          gameOver: false,
        },
        "gameOver"
  
      );
    }

    if (rooms[i].gameOver == false) 
    {
      var j;
      for (j = 0; j < rooms[i].bird.length; j++) 
      {
        if (rooms[i].bird[j].alive == true) 
        {
          updateBirds(j, i);
        
        rooms[i].bird[j].currentScore = rooms[i].bird[j].currentScore + 5
        }
        //console.log(rooms[i].bird[j].currentScore)
      }
      updateTubes(i);
    }

    if(rooms[i].gameOver == true)
    {
      var a;
      for (a = 0; a < rooms[i].bird.length; a++)
      {

        if(rooms[i].bird[a].currentScore > rooms[i].bird[a].highestScore)
        {
          rooms[i].bird[a].highestScore = rooms[i].bird[a].currentScore
        }

        if(rooms[i].bird[a].currentScore > rooms[i].highScore.last.score)
        {
          rooms[i].highScore.last.score=rooms[i].bird[a].currentScore
          rooms[i].highScore.last.name=rooms[i].bird[a].name
         // console.log(rooms[i].highScore)
        }

        if(rooms[i].highScore.last.score > rooms[i].highScore.second.score)
        {
          var save = rooms[i].highScore.last
          rooms[i].highScore.last = rooms[i].highScore.second
          rooms[i].highScore.second = save
          //console.log(rooms[i].highScore)
        }

        if(rooms[i].highScore.second.score > rooms[i].highScore.first.score)
        {
          var save = rooms[i].highScore.second
          rooms[i].highScore.second = rooms[i].highScore.first
          rooms[i].highScore.first = save
          //console.log(rooms[i].highScore)
        }

        rooms[i].bird[a].currentScore=0

       var sql = " UPDATE rooms SET highScore=?, highScore2=? ,highScore3=?,highScore_name=? ,highScore2_name=?,highScore3_name=? WHERE roomsName=?" 
      
       con.query(sql,
        [
         rooms[i].highScore.first.score,
         rooms[i].highScore.second.score,
         rooms[i].highScore.last.score,
         rooms[i].highScore.first.name,
         rooms[i].highScore.second.name,
         rooms[i].highScore.last.name,
         rooms[i].roomName
        ],function (err, result) {

        if (err) throw err;
      });
      } 


    }

    emitGlobal(
      i,
      {
        bird: rooms[i].bird,
        tubesTop: rooms[i].tubesTop,
        tubesBottom: rooms[i].tubesBottom,

      },
      "birdLocation"
    );
  }
}, 100);