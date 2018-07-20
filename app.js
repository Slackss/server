const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // POST
const mysql = require('mysql');
const fs = require('fs');
const con = mysql.createConnection({
    host: 'localhost',
    //host: '18.222.191.92',
    user: 'root',
    password: '1111',
    database: 'slacks'
});

/*
    ==DB DATA==
CREATE DATABASE SRinfra CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE TABLE login
(
    `pCode`     INT            NOT NULL    AUTO_INCREMENT,
    `id`        VARCHAR(24)    NOT NULL,
    `password`  VARCHAR(24)    NOT NULL,
    `name`      VARCHAR(24)    NULL,
    PRIMARY KEY (pCode)
);
CREATE TABLE sns
(
    `id`        INT             NOT NULL    AUTO_INCREMENT,
    `writer`  VARCHAR(24)             NOT NULL,
    `date`      DATETIME        NOT NULL,
    `content`   VARCHAR(500)    NOT NULL,
    `img`   VARCHAR(500)    NOT NULL,
    PRIMARY KEY (id)
);
*/


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

con.connect();

app.listen(3000, () => {
    console.log("[Slacks SERVER 3000]");
})

app.post('/auth/signin', (req, res) => { // 로그인
    var id = req.body.id; // 유저 아이디
    var pw = req.body.pw; // 유저 패스워드
    var sql = "SELECT id,password FROM login WHERE id=?"
    con.query(sql, [id], (err, result, fields) => {
        if (err) {
            res.status(505).end(); // 에러 시 505
        }
        if (!result[0]) {
            console.log("login id x");
            res.status(405).end(); // 아이디가 없을 시 405
        }
        else {
            if (result[0].password == pw) {
                console.log(`[LOGIN USER]\nID : ${id}`);
                res.status(200).end(); // 성공 시 200
            }
            else {
                console.log("login pw x");
                res.status(405).end(); // 비밀번호 불일치 시 405
            }
        }

    })
})
app.post('/auth/signup', (req, res) => { // 회원가입
    var name = req.body.name; // 유저 이름
    var id = req.body.id; // 유저 아이디
    var pw = req.body.pw; // 유저 패스워드
    if (!name || !id || !pw) {
        console.log("[NOT DATA]")
        res.status(405).end() // 데이터가 없을 시 405
    }
    else {
        var sql = "SELECT id FROM login WHERE id=?";
        con.query(sql, [id], (err, result, fields) => {
            if (err) {
                res.status(505).end(); // 에러 시 505
            }
            if (!result[0]) {
                var sql = "INSERT INTO login (id, password, name) VALUES(?,?,?)";
                con.query(sql, [id, pw, name], (err, result, fields) => {
                    if (err) {
                        res.status(505).end(); // 에러 시 505
                    }
                    else {
                        var date = new Date();
                        console.log(`[Create User]\nID : ${id}\nNAME : ${name}`);
                        res.status(200).end() // 제대로 생성됬을 시 200
                    }
                })
            }
            else {
                console.log("[SAME USER]")
                res.status(405).end(); // 이미 있는 사용자일시 405
            }
        });
    }
})

app.post('/auth/find', (req, res) => { // 비밀번호 변경을 위한 유저 찾기
    var id = req.body.id; // 유저 아이디
    var name = req.body.name; // 유저 이름
    if (!name || !id) {
        console.log("[NOT DATA]")
        res.status(405).end() // 데이터가 없을 시 405
    }
    else {
        var sql = "SELECT id,name FROM login WHERE id=?";
        con.query(sql, [id], (err, result, fields) => {
            if (err) {
                res.status(505).end(); // 에러 시 505
            }
            if (!result[0]) {
                console.log("[NOT DATA]")
                res.status(405).end() // 데이터가 없을 시 405
            }
            else {
                if (result[0].name == name) {
                    console.log("[FIND DATA]")
                    res.status(200).end() // 찾았을 시 200
                }
            }
        });
    }
})
app.post('/auth/change', (req, res) => { // 유저찾기에 성공시 비밀번호 변경
    var id = req.body.id; // 유저 아이디
    var pw = req.body.password; // 유저 패스워드

    var sql = "UPDATE login SET password=? WHERE id=?"
    con.query(sql, [pw, id], (err, result, fields) => {
        if (err) {
            res.status(505).end(); // 에러 시 505
        }
        else {
            console.log("[CHANGE DATA]")
            res.status(200).end(); // 성공 시 200
        }
    })
})

app.post("/sns", (req, res) => {
    var writer = req.body.writer;
    var content = req.body.content;
    var img = req.body.img;
    if (writer && content) {
        var day = new Date();
        var sql = "INSERT INTO sns (writer, date, content,img) VALUES(?,now(),?,?)";
        var link = "http://18.222.191.92:3000/profile_none.png";
        switch (img) {
            case 0:
                link = "http://18.222.191.92:3000/profile1.png"
                break;
            case 1:
                link = "http://18.222.191.92:3000/profile2.png"
                break;
            case 2:
                link = "http://18.222.191.92:3000/profile3.png"
                break;
            case 3:
                link = "http://18.222.191.92:3000/profile4.png"
                break;
        }
        con.query(sql, [writer, content, link], (err, result, fields) => { //con.escape(day)
            if (err) { res.status(505).end() };
            console.log("[SNS UPLOAD]");
            res.status(200).end();
        })
    }
})
app.get("/sns", (req, res) => {
    var sql = "SELECT * FROM sns";
    con.query(sql, (err, result, fields) => {
        if (err) { res.status(505).end() };
        console.log("[SNS FIND]")
        res.send(result.reverse());
    })
})

app.get("/tip", (req, res) => {
    fs.readFile("public/tip.json", (err, data) => {
        res.send(JSON.parse(data));
    })
})

app.get("/sports", (req, res) => {
    fs.readFile("public/paralympiques/data.json", (err, data) => {
        res.send(JSON.parse(data));
    })
})


app.get("/place", (req, res) => {
    fs.readFile("place.json", (err, data) => {
        res.send(JSON.parse(data));
    })
})
