var express = require("express");
var app = express();
const path = require('path');
const fs = require("fs");

app.use(express.static("public"));
app.use(express.static(__dirname+"/public"));
app.set("view engine", "ejs");

// app.get("/GetQuiz/:Lang/:SubCat/:Word", (req,res)=>{
//     fs.readFile(__dirname+"/public/quiz/"+req.params.Lang+"/"+req.params.SubCat+"/"+req.params.Word+".json", (err,data)=>{
//         if(err){
//             res.send(err);
//         }else{
//             res.header("Content-Type",'application/json');
//             res.send(data);
//             //res.json(data);
//             //res.end(data);
//         }
//     });
// });

app.get("/GetTypeList/:Lang/:Word", (req,res)=>{
    fs.readFile(__dirname+"/public/TYPE/words/"+req.params.Lang+"/"+req.params.Word+".json", (err,data)=>{
        if(err){
            res.send(err);
        }else{
            res.header("Content-Type",'application/json');
            res.send(data);
            //res.json(data);
            //res.end(data);
        }
    });
});

app.get("/",function(req,res){
      res.send("Hello?");  				    //ブラウザ上に表示される
      console.log("Someone Connected!");	//コンソール上に表示される
});

// 曲変化・格変化トレーナー
app.get("/Language", function(req,res){
    //res.sendFile(path.join(__dirname+'/public/Language.html'));
    let rawdata = fs.readFileSync(path.join(__dirname+'/public/quiz/list.json'));
    let student = JSON.parse(rawdata);
    res.render("Language.ejs", {contentsJson:student});
});
// タイピング
app.get("/Type", function(req,res){
    res.sendFile(path.join(__dirname+'/public/TYPE/typing.html'));
    //res.render("Language.ejs");
});
// エラー
app.get("*", function(req,res){	　　            //*は全ての要求をキャッチする。
    res.send("Nothing to see here.");
});
// サーバーを開始
app.listen(8080, "localhost", function(){
    console.log("server has started:" + "0.0.0.0");
});
