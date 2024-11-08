import express from "express"
import cors from "cors"
import morgan from "morgan"
import {createServer} from "node:http"
import { Server } from "socket.io"
const app = express()
const serverPort = 4000
const server = createServer(app)

const words = ["VERDE","ROPAS","SEÑAS","CIEGO","COCHE","AGUJA","RADIO"]

const io = new Server(server,{
    cors:{
        origin: "*",
        methods: ["GET", "POST"],
    }
})

app.use(morgan("dev"))
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
}))

//Rutas
app.use("/",(req,res)=> res.send('ta andando'))

//Soquete
let userList = []

io.on("connection",(socket)=>{
    console.log('hola -->', socket.id)
    socket.on("addUser",(user)=>{
        const index = userList.findIndex((el)=>el.id == socket.id)
        if (index == -1){
            userList.push(user)
        }else{
            userList[index] = user
        }
        socket.emit("getUsers",userList)
    })

    socket.emit("getUsers",userList)

    socket.on('disconnect',()=>{
        const index = userList.findIndex((el)=>el.id == socket.id)
        if (index != -1){
            userList.splice(index ,1)
        }
        console.log("se ha desconectado -->",socket.id)
    })



    // Word
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
    let word = words[getRandomInt(words.length)]
    socket.emit("newWord",word)
    // setInterval(() => {
    //     console.log('nueva palabra -->',word)
    //     socket.emit("newWord",word)
    // }, 10000);

    socket.on("newGuess",(guess)=>{
        console.log('nueva adivinanza -->',guess)
        if(guess == word){
            console.log('adivinó')
            word = words[getRandomInt(words.length)]
            socket.emit("newWord",word)
        }
    })

})



server.listen(serverPort, ()=>console.log(`server corriendo: ${serverPort}`))