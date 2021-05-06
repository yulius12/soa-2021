const express = require('express');
const port=process.env.PORT||3000;
const mysql = require('mysql');
const querystring = require('querystring');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const jwt = require("jsonwebtoken");
const multer= require("multer");
const fs= require("fs");
const morgan=require('morgan');
const accessLogStream  = fs.createWriteStream('./218116707.log', {flags:'a'},);

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tes_ahkir_senin_01"
});


connection.connect();
msg='';
tanggal='';
// wt='';
morgan.token('msg',(req,res)=>{return msg});
morgan.token('tg',(req,res)=>{return tanggal});
// morgan.token('wt',(req,res)=>{return tanggal});

let format = morgan(`Method::method; URL::url; Status::status; Message: :msg; :tg ResponseTime: :response-time ms `,{stream:accessLogStream});
app.use(format);
let token = "t3sAhk1r";
let tokensekarang = "";

gambaruser='';
cekjpg='';

const datauser = multer.diskStorage(
    {
        destination:function (req,file,callback) {
            callback(null,"./uploads/username");
        },
        filename:async function (req,file,callback) {
            const extension = file.originalname.split('.')[file.originalname.split('.').length-1];
            gambaruser=req.body.username+'.'+extension;
            cekjpg = extension;
            console.log(gambaruser)
            
            callback(null,(gambaruser));
        }
    }
);
const uploadsfotouser=multer({storage:datauser});
const datausers = multer.diskStorage(
    {
        destination:function (req,file,callback) {
            callback(null,"./uploads/username");
        },
        filename:async function (req,file,callback) {
            try {
                var user = jwt.verify(tokensekarang,token);
            } catch (error) {
                        var tg = new Date();
                var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
                var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
                var tahun = tg.getFullYear();
          
                tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
                msg="unauthorized";
            }
            console.log(user)
            const extension = file.originalname.split('.')[file.originalname.split('.').length-1];
            gambaruser=user.username+'.'+extension;
            cekjpg = extension;
            console.log(gambaruser)
            
            callback(null,(gambaruser));
        }
    }
);
const uploadsfotousers=multer({storage:datausers});


app.post('/api/users/register',uploadsfotouser.single("foto"),async function (req,res) {
    let nama_user  = req.body.nama_user;
    let email  = req.body.email;
    let password  = req.body.password;
    let username  = req.body.username;
    let foto  = req.body.foto;
    
    let jumlahuser = await CekUser(username)
    let jumlahemail = await CekEmail(email)
    try {
        let foto_user  = req.file.Gambar;
    } catch (error) {
         var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="wajib menyertakan  gambar";
        return res.status(400).send(msg);
    }

    if (jumlahuser!=0) {
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="username sudah ada";
        return res.status(400).send(msg);
    }
    if (jumlahemail!=0) {
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="email sudah ada";
        return res.status(400).send(msg);
    }
    if (cekjpg!='jpg') {
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="format foto salah";
        return res.status(400).send(msg);
    }

    let hasil = "/uploads/username/"+username+".jpg";
    connection.query(`INSERT INTO users VALUES(?,?,?,?,?)`, [username,email,password,nama_user,hasil] ,(err,result,field) => {
        if(err) return  res.status(400).send(err);
        
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="Berhasil menambahkan user";
        return res.status(201).send({
            "nama_user":nama_user,
            "email":email,
            "username":username,
            "password":password,
        });
    });
});
app.post('/api/users/login',async function (req,res) {
    let username  = req.body.username;
    let password  = req.body.password ;
    if (username == "admin" && password == "admin") {
        tokensekarang = jwt.sign({"username":"admin","email":"admin","nama":"admin"},token,{expiresIn:"900s"})
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="berhasil login";
        return  res.status(200).send({
            "username:" : "admin",
            "jwt_key" : tokensekarang,
        });
    }
    connection.query(`select * from users where username= ?`, [username] ,(err,result,field) => {
        if(err) return  res.status(400).send(err);
        else{
            if (result.length > 0 ) {
                if (result[0].password != password) {
                    var tg = new Date();
                    var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
                    var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
                    var tahun = tg.getFullYear();
  
                    tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
                    msg="password salah";
                    return res.status(404).send(msg);
                }
                tokensekarang = jwt.sign({"username":result[0].username,"email":result[0].email,"nama":result[0].nama,"password":result[0].password},token,{expiresIn:"900s"})
                        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
                    msg="berhasil login";
            return  res.status(200).send({
                    "username:" : result[0].username,
                    "jwt_key" : tokensekarang,
                });
            }
        }
        
    });
});

app.post('/superman',async function (req,res) {
    return res.send("superman");
});

app.get('/api/users',async function (req,res) {
    let username = req.query.username;
    if (username == undefined || username == "") {
        connection.query(`SELECT username as "username" ,nama  as "nama"  FROM users`, (err,result,field) => {
            if(err) return  res.status(400).send(err);
            else{
                return res.status(200).send(result);
            }
        }); 
    }
    else{
        connection.query(`SELECT username as "username" ,nama  as "nama"  FROM users where username like  '%${username}%'`, (err,result,field) => {
            if(err) return  res.status(400).send(err);
            else{
                return res.status(200).send(result);
            }
        }); 
    }
});

app.put('/api/users/update',uploadsfotousers.single("foto"),async function (req,res) {
    let nama_user  = req.body.nama_user;
    let password  = req.body.password;
    let foto  = req.body.foto;
    var header = req.header;

    if(!req.header('x-auth-token') || header==""){
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    try {
        var user = jwt.verify(tokensekarang,token);
    } catch (error) {
                var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    if (user.username == "admin") {
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    else{
        connection.query(`update users set nama = ?,foto=?,password=?  where username = ?`, [nama_user,"uploads/username/"+user.username+".jpg",password,user.username],(err,result,field) => {
            if(err)return  res.status(400).send(err);
            else{
                nama = user.nama;
                passwordlama = user.password;
                user.nama = nama_user;
                user.password = password;
                return  res.status(200).send({
                    "username":user.username,
                    "nama_lama":nama,
                    "nama_baru":nama_user,
                    "password_lama":passwordlama,
                    "password_baru":password,
                });
            }
            // ctr_pegawai  =;   
        }); 
    }
});

app.post('/api/tickets/add',uploadsfotouser.single("foto"),async function (req,res) {
    let stasiun_asal  = req.body.stasiun_asal;
    let stasiun_tujuan  = req.body.stasiun_tujuan;
    let jadwal_keberangkatan  = req.body.jadwal_keberangkatan;
    let jadwal_tiba  = req.body.jadwal_tiba;
    let harga  = req.body.harga;
    var header = req.header;
    
    if(!req.header('x-auth-token') || header==""){
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    try {
        var user = jwt.verify(tokensekarang,token);
    } catch (error) {
                var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    if (user.username != "admin") {
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    else{
        let jumlah = await CekTicket();
        jumlah++;
        let zerosCtr = "";
        if (jumlah < 10) {
            zerosCtr = "000";
        } else if (jumlah >= 10 && jumlah< 100) {
            zerosCtr = "00";
        }else if (jumlah >= 100 && jumlah< 1000) {
            zerosCtr = "0";
        }
        else{
            zerosCtr = "";
        }
        
        let kode = "T"+zerosCtr +jumlah;
        var regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if(!regex.test(jadwal_keberangkatan)){
            var tg = new Date();
            var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
            var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
            var tahun = tg.getFullYear();
      
            tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
            msg="tidak sesuai ketentuan";
            return res.status(401).send(msg);
        }
        if(!regex.test(jadwal_tiba)){
            var tg = new Date();
            var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
            var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
            var tahun = tg.getFullYear();
      
            tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
            msg="tidak sesuai ketentuan";
            return res.status(401).send(msg);
        }
        connection.query(`INSERT INTO tickets VALUES(?,?,?,?,?,?)`, [kode,stasiun_asal,stasiun_tujuan,jadwal_keberangkatan,jadwal_tiba,harga],(err,result,field) => {
            if(err)return  res.status(400).send(err);
            else{
                var tg = new Date();
                var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
                var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
                var tahun = tg.getFullYear();
          
                tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
                msg="berhasil insert";
                return  res.status(200).send({
                    "kode_tiket":kode,
                    "stasiun_asal":stasiun_asal,
                    "stasiun_tujuan":stasiun_tujuan,
                    "jadwal_keberangkatan":jadwal_keberangkatan,
                    "jadwal_tiba":jadwal_tiba,
                });
            }
            // ctr_pegawai  =;   
        }); 
    }

});

app.get('/api/tickets',async function (req,res) {
    let stasiun_asal = req.query.stasiun_asal;
    let stasiun_tujuan = req.query.stasiun_tujuan;
    if (stasiun_asal =="" && stasiun_tujuan ==""  ) {
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="berhasil mencari";
        connection.query(`SELECT kode  as "kode_tiket",asal  as "stasiun_asal",tujuan as "stasiun_tujuan",harga as "harga"  FROM tickets`, (err,result,field) => {
            if(err) return  res.status(400).send(err);
            else{
                return res.status(200).send(result);
            }
        }); 
    }
    else if (stasiun_asal =="") {
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="berhasil mencari";
        connection.query(`SELECT kode  as "kode_tiket",asal  as "stasiun_asal",tujuan as "stasiun_tujuan",harga as "harga"  FROM tickets where tujuan   like '%${stasiun_tujuan}%' `, (err,result,field) => {
            if(err) return  res.status(400).send(err);
            else{
                return res.status(200).send(result);
            }
        }); 
    }
    else if (stasiun_tujuan =="") {
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="berhasil mencari";
        connection.query(`SELECT kode  as "kode_tiket",asal  as "stasiun_asal",tujuan as "stasiun_tujuan",harga as "harga"  FROM tickets where asal like '%${stasiun_asal}%'`, (err,result,field) => {
            if(err) return  res.status(400).send(err);
            else{
                return res.status(200).send(result);
            }
        }); 
    }
    
    else{
        connection.query(`SELECT kode  as "kode_tiket",asal  as "stasiun_asal",tujuan as "stasiun_tujuan",harga as "harga"  FROM tickets where asal like '%${stasiun_asal}%' and tujuan like '%${stasiun_tujuan}%'`, (err,result,field) => {
            if(err) return  res.status(400).send(err);
            else{
                return res.status(200).send(result);
            }
        }); 
    }
});

app.get('/api/tickets/history/',async function (req,res) {
    var header = req.header;
    
    if(!req.header('x-auth-token') || header==""){
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    try {
        var user = jwt.verify(tokensekarang,token);
    } catch (error) {
                var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    if (user.username == "admin") {
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="berhasil mencari";
        connection.query(`SELECT kode as "kode_transaksi", kode_tiket  as "kode_tiket",kode_user as "username",jumlah,total  FROM transaksi`, (err,result,field) => {
            if(err) return  res.status(400).send(err);
            else{
                return res.status(200).send(result);
            }
        }); 
    }
    else{
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="berhasil mencari";
        connection.query(`SELECT kode as "kode_transaksi", kode_tiket  as "kode_tiket",kode_user as "username",jumlah,total  FROM transaksi where kode_user = ?`,[user.username], (err,result,field) => {
            if(err) return  res.status(400).send(err);
            else{
                return res.status(200).send(result);
            }
        }); 
    }
});
app.post('/api/tickets/buy',async function (req,res) {
   let kode_tiket = req.body.kode_tiket;
   let  jumlah = req.body.jumlah;
    
    var header = req.header;
    
    if(!req.header('x-auth-token') || header==""){
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    try {
        var user = jwt.verify(tokensekarang,token);
    } catch (error) {
                var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();
  
        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="unauthorized";
        return res.status(401).send(msg);
    }
    if (user.username == "admin") {
        var tg = new Date();
        var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
        var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
        var tahun = tg.getFullYear();

        tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
        msg="hanya user yang bisa ";
        return res.status(400).send(msg);
    }
    else{
        let ticket = await CekTicketid(kode_tiket);
        if (ticket.length == 0) {
            var tg = new Date();
            var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
            var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
            var tahun = tg.getFullYear();
    
            tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
            msg="tiket tidak ditemukan";
            return res.status(400).send(msg);
        }

        let jumlahs = await CekTransaksi();
        jumlahs++;
        let zerosCtr = "";
        if (jumlahs < 10) {
            zerosCtr = "0000";
        } else if (jumlahs >= 10 && jumlahs< 100) {
            zerosCtr = "000";
        }else if (jumlahs >= 100 && jumlahs< 1000) {
            zerosCtr = "00";
        }
        else if (jumlahs >= 1000 && jumlahs< 10000) {
            zerosCtr = "0";
        }
        else{
            zerosCtr = ""; 
        }
        let kode = "T"+zerosCtr +jumlahs;
        console.log(parseInt(ticket[0].harga)*parseInt(jumlah));
        connection.query(`INSERT INTO transaksi VALUES(?,?,?,?,?)`, [kode,user.username,ticket[0].kode,jumlah,parseInt(ticket[0].harga)*parseInt(jumlah)],(err,result,field) => {
            if(err)return  res.status(400).send(err);
            else{
                var tg = new Date();
                var date = tg.getDate() < 10 ?"0"+tg.getDate():tg.getDate();
                var bulan =tg.getMonth()+1 < 10 ?"0"+(tg.getMonth()+1):tg.getMonth()+1;
                var tahun = tg.getFullYear();
          
                tanggal = "DateTime: "+ date+"/" +bulan+"/"+tahun+";";
                msg="berhasil insert";
                return  res.status(200).send({
                    "kode_transaksi":kode,
                    "username":user.username,
                    "kode_tiket":ticket[0].kode,
                    "jumlah":parseInt(jumlah),
                    "total":parseInt(ticket[0].harga)*parseInt(jumlah),
                });
            }
            // ctr_pegawai  =;   
        }); 
    }
});


async function CekUser(username) {
    return new Promise(function(resolve,reject) {
        connection.query(`SELECT count(	username ) as "jumlah"  FROM users where username = ? `,[username], (err,result,field) => {
            if(err) throw reject(err);
            else{
                resolve(result[0].jumlah)
            }
        }); 
    });
};
async function CekEmail(email) {
    return new Promise(function(resolve,reject) {
        connection.query(`SELECT count(	username ) as "jumlah"  FROM users where email = ? `,[email], (err,result,field) => {
            if(err) throw reject(err);
            else{
                resolve(result[0].jumlah)
            }
        }); 
    });
};
async function CekTicket(email) {
    return new Promise(function(resolve,reject) {
        connection.query(`SELECT count(	kode ) as "jumlah"  FROM tickets`, (err,result,field) => {
            if(err) throw reject(err);
            else{
                resolve(result[0].jumlah)
            }
        }); 
    });
};
async function CekTicketid(kode) {
    return new Promise(function(resolve,reject) {
        connection.query(`SELECT *  FROM tickets where kode = ?`,[kode], (err,result,field) => {
            if(err) throw reject(err);
            else{
                resolve(result)
            }
        }); 
    });
};
async function CekTransaksi() {
    return new Promise(function(resolve,reject) {
        connection.query(`SELECT count(	kode ) as "jumlah"  FROM transaksi`, (err,result,field) => {
            if(err) throw reject(err);
            else{
                resolve(result[0].jumlah)
            }
        }); 
    });
};



app.listen(port,function () {
    console.log("Listening to port 3000")
})
