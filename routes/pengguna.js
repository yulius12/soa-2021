const express = require('express');
const router = express.Router();
// const axios = require("axios").default;

let arrpengguna = [
    {"id":"admin","pass":"admin"},
    {"id":"bigboss","pass":"bigboss"}
];

router.get("/",function(req,res) {
    if(req.query.nama){
        const hasil = [];
        for (let index = 0; index < arrpengguna.length; index++) {
            // if (arrpengguna[index].id.includes(req.query.nama)) {
            // if(arrpengguna[index].id.match("/"+req.query.nama+"/i")){
            if(arrpengguna[index].id.match("["+req.query.nama+"]+")){ 
                hasil.push(arrpengguna[index])
            }
            
        }
        if(hasil.length <=0){
            return res.status(404).send({"msg":"Pengguna dengan kriteria tidak ditemukan"});
        }
        else{
            return res.status(200).send(hasil)
        }
    }
    else{
        return res.status(200).send(arrpengguna);
    }
    // arrpengguna.push({"id":"admin","pass":"admin"});
});

router.delete("/:id",function (req,res) {
    for (let i = 0; i < arrpengguna.length; i++) {
        if (arrpengguna[i].id == req.params.id) {
            let hasildel = arrpengguna.splice(i,1)[0];
            return res.status(200).send(hasildel);
        }
    }
    return res.status(404).send({"msg":"Data Id Pengguna tidak ditemukan"})
})

// router.get("/",function(req,res) {
//     if(req)
//     arrpengguna.push({"id":"admin","pass":"admin"});
//     return res.status(200).send(arrpengguna);
// })

module.exports= router;