const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const { route } = require('./pengguna');
const pool = mysql.createPool({host:"localhost",database:"coba",user:"root",password:""})
const resepModel = require("./../model/resep");
const multer= require("multer");
const fs = require('fs')
const storage = multer.diskStorage(
    {
        destination:function (req,file,callback) {
            callback(null,"./uploads");
        },
        filename:function (req,file,callback) {
            const filename =file.originalname.split(".");
            const extension = filename[filename.length-1];
            let namauser = req.params.nama;
            if(!namauser){
                namauser = req.body.nama;
            }
            callback(null,namauser+"."+extension);
        }
    }
);
const uploads=multer({storage:storage});
// function getConn() {
//     return new Promise(function (resolve,reject) {
//         pool.getConnection(function (err,connection) {
//             if (err) {
//                 // jika error dibatalkan
//                 reject(err);
//             }else{
//                 //jika berhasil dilanjutkan
//                 resolve(connection);
//             }
//         })
//     })
// }
// function executeQuery(conn,q) {
//     return new Promise(function (resolve,reject) {
//         conn.query(q,function (err,result) {
//             if (err) {
//                 reject(err);
//             }else{
//                 //result hasil dari querynya
//                 resolve(result);
//             }
//         })
//     })
// }

router.get("/",async function (req,res) {
    try {
        const conn = await getConn();
        let perintah="";
        if (req.query.id) {
            perintah=`select * from resep where id=${req.query.id}`;
        }
        else{
            perintah="select * from resep";
        }
        const hasil = await executeQuery(conn,perintah);
       conn.release();
       return res.status(200).send(hasil)
    } catch (ex) {
        return res.status(500).send(ex)
    }
})
router.post('/',uploads.single("foto"),async function (req,res) {
    try {
        return res.status(201).send(await resepModel.insert(req.body.nama,req.body.type,req.body.jumlah))
    } catch (ex) {
        return res.status(500).send(ex);    
    }
    
});

router.put('/:id',uploads.single("foto"),async function (req,res) {
    
    
    try {
        let hasilresep = await resepModel.findbyid(req.params.id);
        let namafilelama = "a.jpg"
        fs.unlinkSync(`./uploads/${namafilelama}`); // hapus file foto lama did folder uploads
        // return res.send("a")
        let namafilefotobaru =req.file.filename;//mestinya namafilefotobaru di update ke tabel resep
        return res.status(200).send(await resepModel.insert(req.body.nama,req.body.type,req.body.jumlah))
    
    } catch (ex) {
        return res.status(500).send(ex);
    }
    
});
module.exports= router;