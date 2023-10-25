const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pas1035',
  database: 'app',
});

connection.connect((err) => {
    if (err) {
      console.log('error connecting: ' + err.stack);
      return;
    }
    console.log('success');
  });
/**
 * "/"にアクセスがあったらindex.htmlを返却
 */
app.get("/video&AdminPanel/", (req, res)=>{
  res.sendFile(__dirname + "/index.html");
});
app.get("/reception/", (req, res)=>{
  res.sendFile(__dirname + "/reception.html");
});
// 
app.get("/ranking/", (req, res)=>{
  connection.query(
    "SELECT * FROM ranking WHERE ForG = 'F' ORDER BY totaltimeplayed LIMIT 5;",
    (error, results) => {
      htmltext="<!DOCTYPE html><html><head><title>ranking</title></head><body><h1>ランキング</h1><p>順位  チーム名  時間（秒）</p>";
      for (let step = 0; step < results.length; step++) {
        htmltext=htmltext+"<p>"+Number(step+1)+"位 "+results[step].name+" "+results[step].totaltimeplayed+"</p>";
      }
      htmltext = htmltext+"</body></html>";
      res.send(htmltext);
    }
  );});
  // SELECT * FROM ranking ORDER BY totaltimeplayed DESC;
app.get('/all', (req, res) => {
  // connection.query('CREATE DATABASE ranking', function (err, result) {
  //     if (err) throw err;
  //     console.log('database created');
  //   });
  connection.query(
    'SELECT * FROM ranking',
    (error, results) => {
      htmltext="";
      for (let step = 0; step < results.length; step++) {
          htmltext=htmltext+"<p>id:"+results[step].id+" name:"+results[step].name+" totaltimeplayed:"+results[step].totaltimeplayed+" starttime:"+results[step].starttime+" ForG:"+results[step].ForG+"</p>";
    
      }
      res.send(htmltext);
    }
  );
});
/**
 * [イベント] ユーザーが接続
 */
function whattimeisit(){
  let today = new Date();
   // 日を取得
  let date = today.getDate();
            // 時分を取得
  let hour = today.getHours();
  let minute = today.getMinutes();

  var date1 = ( '00' + Number(date) ).slice( -2 );
  var hour1 = ( '00' + Number(hour) ).slice( -2 );
  var minute1 = ( '00' + Number(minute) ).slice( -2 );

            // 現在時刻を表示する
  let time=date1 +" " + hour1 + ":" + minute1 ;    // 時分
  return time
}
var teamname1 = "";
var teamname2 = "";
var teamname3 = "";
io.on("connection", (socket)=>{
  console.log("ユーザーが接続しました");
  console.log(whattimeisit());
  socket.on("post", (msg)=>{
    io.emit("member-post", msg);
    console.log(msg);
    if (msg.text == "one team finished" || msg.text == "two teams finished" || msg.text == "three teams finished"){
      if (msg.team =="team1"){
        connection.query(
          "INSERT INTO ranking(name,totaltimeplayed,starttime,ForG) VALUES (?,?,?,'F');",
          [teamname1,msg.time,now],
          (error, results) => {
            console.log(results);
          }
            );
      }else if (msg.team == "team2"){
        connection.query(
          "INSERT INTO ranking(name,totaltimeplayed,starttime,ForG) VALUES (?,?,?,'F');",
          [teamname2,msg.time,now],
          (error, results) => {
            console.log(results);
          }
            );
      }else if (msg.team == "team3"){
        connection.query(
          "INSERT INTO ranking(name,totaltimeplayed,starttime,ForG) VALUES (?,?,?,'F');",
          [teamname3,msg.time,now],
          (error, results) => {
            console.log(results);
          }
            );
      }
      }else if (msg.text == "gameover"){
        gteam=msg.team;
         if (gteam.indexOf(1) != -1){
          connection.query(
            "INSERT INTO ranking(name,totaltimeplayed,starttime,ForG) VALUES (?,?,?,'G');",
            [teamname1,msg.time,now],
            (error, results) => {
              console.log(results);
            }
              );
         }
         if (gteam.indexOf(2) != -1){
          connection.query(
            "INSERT INTO ranking(name,totaltimeplayed,starttime,ForG) VALUES (?,?,?,'G');",
            [teamname2,msg.time,now],
            (error, results) => {
              console.log(results);
            }
              );
         }
         if (gteam.indexOf(3) != -1){
          connection.query(
            "INSERT INTO ranking(name,totaltimeplayed,starttime,ForG) VALUES (?,?,?,'G');",
            [teamname3,msg.time,now],
            (error, results) => {
              console.log(results);
            }
              );
         }
    }
  });
  socket.on("reception", (msg)=>{
    console.log(msg);
    now=whattimeisit();
    teamname1 = msg.text1;
    teamname2 = msg.text2;
    teamname3 = msg.text3;
    console.log(teamname1,teamname2,teamname3);
  })
});

/**
 * 3000番でサーバを起動する
 */
http.listen(3000, ()=>{
  console.log("listening on *:3000");
});
  
//   app.listen(8000);
//   // rankingでmysqlを表示する
//   // receptionでmysqlにnameとstarttimeを追加
//   // 管理でmysqlにstarttimeplayedとForGを送る
  