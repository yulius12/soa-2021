const port=process.env.PORT || 3000;

app.get("/",function (req,res) {
    return res.send({type:"Indonesian",menu:["batagor","rujak","kluntung"]})
})

app.listen(port,function () {
    console.log("Listening to port 3000")
})
