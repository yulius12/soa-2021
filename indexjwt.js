const express=require('express');
const app = express();
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
const jwt = require('jsonwebtoken')
require('dotenv').config();


console.log(process.env.secret)

const useraktif=[{
    "username":"admin",
    "password":"admin",
    "is_admin":1
},{
    "username":"upin",
    "password":"upin",
    "is_admin":0
}]

function cekjwt(req,res,next) {
    if (!req.headers["x-auth-token"]) {
        return res.status(401).send({"msg":"Token tidak ada"});
    }
    let token = req.headers["x-auth-token"];
    let user = null;
    
    try {
        user = jwt.verify(token, process.env.secret);
        // user = jwt.verify(token, "456");
    } catch (e) {
        return res.status(400).send(e)
    }

    req.user=user;
    next();
}

function cekAdmin(req,res,next) {
    if (!req.user.is_admin) {
        return res.status(403).send({"msg":"Hanya admin yang boleh akses endpoint ini"})
    }
    next();
}
app.post("/api/login",function (req,res) {
    const username =req.body.username;
    const password =req.body.password;
    console.log(process.env.secret);
    let ada = null;
    for (let i = 0; i < useraktif.length; i++) {
        if (useraktif[i].username == username && useraktif[i].password == password) {
            ada = useraktif[i]
        }        
    }
    if (!ada) {
        return res.status(400).send({"msg":"Username atau passwordd salah "})
    }
    let token = jwt.sign({"username":ada.username,"is_admin":ada.is_admin},process.env.secret,{notBefore:"20s"})
    // let token = jwt.sign({"username":ada.username,"is_admin":ada.is_admin},"456",{notBefore:"20s"})
    return res.status(200).send({"token":token})
})

app.post("/api/register",function (req,res) {
    const username =req.body.username;
    const password =req.body.password;
    console.log(password);
    const userbaru ={
        "username" :username,
        "password" :password,
        "is_admin" :0
        // "api_key"  :Math.random().toString(36).substr(2,8),
    }
    useraktif.push(userbaru);
    console.log(useraktif);
    return res.status(200).send({"username":userbaru.username,"api_key":userbaru.api_key});

})

app.get("/",[cekjwt,cekAdmin],function (req,res) {
    console.log(req.isUserAktif)
    return res.render("displaymenu",{type:"Indonesian",menu:["batagor","rujak","kluntung"]})
})

    app.listen(3000,function () {
        console.log("Listening to port 3000")
    })
