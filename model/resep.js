const mysql = require('mysql');
const pool = mysql.createPool({host:"localhost",database:"coba",user:"root",password:""})

// const multer= require("multer");
// const storage = multer.diskStorage(
//     {
//         destination:function (req,file,callback) {
//             callback(null,"./uploads");
//         },
//         filename:function (req,file,callback) {
//             const filename =file.originalname.split(".");
//             const extension = filename[filename.length-1];
//             callback(null,Date.now()+"."+extension);
//         }
//     }
// );
// const uploads=multer({storage:storage});

function getConn() {
    return new Promise(function (resolve,reject) {
        pool.getConnection(function (err,connection) {
            if (err) {
                // jika error dibatalkan
                reject(err);
            }else{
                //jika berhasil dilanjutkan
                resolve(connection);
            }
        })
    })
}

function executeQuery(conn,q) {
    return new Promise(function (resolve,reject) {
        conn.query(q,function (err,result) {
            if (err) {
                reject(err);
            }else{
                //result hasil dari querynya
                resolve(result);
            }
        })
    })
}

async function findbyid(id) {
    const conn = await getConn();
    const perintah = `select * from resep where id='${id}'`;
    const hasil = await executeQuery(conn,perintah);
    conn.release();
    if(hasil.length > 0){
        return hasil[0];
    }
    else{
        return null;
    }
}

async function insert(namaresep,typeresep,jumlah) {
    const conn  = await getConn();
    const hasil = await executeQuery(conn,`INSERT INTO resep (nama,type,jumlah)VALUES ('${namaresep}','${typeresep}','${jumlah}')`);
    conn.release();
    return await findbyid(hasil.insertId)
}

async function update(id,namaresep,typeresep,jumlah) {
    const conn  = await getConn();
    const hasil = await executeQuery(conn,`UPDATE  resep set  nama='${namaresep}',type='${typeresep}',jumlah=${jumlah} where id=${id}`);
    conn.release();
    return await findbyid(id)
}

module.exports={
    "findbyid":findbyid,
    "insert":insert,
    "update":update
}