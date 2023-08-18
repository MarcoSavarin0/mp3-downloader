const express = require('express')

require('dotenv').config();
const routes = require('./routes/indexRoute');


const app = express()

const PORT = process.env.PORT || 3000;

app.set('view engine', "ejs")
app.use(express.static("public"))

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())
app.use('/', routes)

app.listen(PORT,()=>{
    console.log('Server Iniciado en el puerto' + PORT);
})