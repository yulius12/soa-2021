const express=require('express');
const port=process.env.PORT || 3000:
const app = express();
app.set('view engine','ejs');
const pengguna = require('./routes/pengguna');
const resep = require('./routes/resep');
const aksesapi = require('./routes/aksesapi')
const useraktif=[{
    "username":"admin",
    "password":"admin",
    "api_key":"abcde01234"
}]

app.use(express.urlencoded({extended:true}));
function cekapikey(req,res,next) {
    if (!req.headers["x-api-key"]) {
        return res.status(401).send({"msg":"Anda tidak boleh mengakses API ini"});
    }
    let apikey = req.headers["x-api-key"];
    let ada = false;
    for (let index = 0; index < useraktif.length; index++) {
       if (useraktif[index].api_key == apikey) {
           ada=true;
       }
    }
    if (!ada) {
        return res.status(400).send({"msg":"API Key tidak terdaftar di sistem"});
    }
    req.isUserAktif=true;
    next();
}
app.get("/",cekapikey,function (req,res) {
    console.log(req.isUserAktif)
    return res.render("displaymenu",{type:"Indonesian",menu:["batagor","rujak","kluntung"]})
})
app.get("/superman",cekapikey,function (req,res) {
    return res.send(superman);
})
app.post("/api/register",function (req,res) {
    const username =req.body.username;
    const password =req.body.password;
    console.log(password);
    const userbaru ={
        "username" :username,
        "password" :password,
        "api_key"  :Math.random().toString(36).substr(2,8),
    }
    useraktif.push(userbaru);
    console.log(useraktif);
    return res.status(200).send({"username":userbaru.username,"api_key":userbaru.api_key});

})

app.use("/api/pengguna",pengguna);
app.use("/api/resep",resep);
app.use("/api/aksesapi",aksesapi);
app.listen(port,function () {
    console.log("Listening to port 3000")
})
