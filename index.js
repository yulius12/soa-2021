const port=process.env.PORT || 3000;

app.get("/coba",function (req,res) {
    return res.send("aa")
})

app.listen(port,function () {
    console.log("Listening to port 3000")
})
