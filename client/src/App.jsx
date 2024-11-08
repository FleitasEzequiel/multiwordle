import { useEffect, useState } from 'react'
import io from "socket.io-client"
import './style.css'

const socket = io("http://localhost:4000")

function App() {
  socket.onAny((event)=>{
    console.log(event)
  })

  const [word, setWord] = useState()
  const [guess, setGuess] = useState("-----")
  const [colors,setColors] = useState([0,0,0,0,0])
  
  const updateUsers = () =>{
    socket.on("getUsers",(userList)=>{
      setUsers(userList)
    })
  }

  const handleGuess = (e) =>{
    e.preventDefault()
    const formData = new FormData(e.target)
    const guess = formData.get("guess")
    const wArr = word.split("")
    const gArr = guess.split("")
    let result = []
    // 1 = TABIEN 2 = MEJOR 0 = TAMAL
    for(let i = 0; i < wArr.length; i++){
      switch(true){
        case(wArr[i] == gArr[i]):
        result[i] = 1
        break;
        case(wArr.includes(gArr[i])):
        result[i] = 2
        break;
        default:
          result[i] = 0
        break;
      }
    }
    setColors(result)
    setGuess(guess)
    if(guess == word){
      socket.emit("newGuess",guess)
    }
  }

  socket.on("newWord",(data)=>{
    console.log('se cambió')
    setWord(data)
  })

  const handleForm = (e) =>{
    const formData = new FormData(e.target)
    e.preventDefault()

    const alias = formData.get("Username")
    console.log(alias)
    socket.emit("addUser",{"id":socket.id,alias})
    updateUsers()
  }
  const [users, setUsers] = useState([{"hola":"hola2"}])
  const array = []
  useEffect(()=>{
    socket.on('connect', () => {
      console.log('Connected to the server')
      updateUsers()

    })


    return ()=>{
      socket.disconnect();
    }
  },[])

  return (
    <>
    <form onSubmit={handleForm}>
      <label htmlFor="Username"> Alias:</label>
      <input type="text" name="Username" id="" placeholder='alias'/>
      <button  > Ok</button>
    </form>
    <ul>
      {
        users.map((user, index)=>{
          return <div key={index} style={{"backgroundColor":"gray", "boxShadow":"30px"}}>
            {user.alias}
            </div>
        })
      }
        </ul>
        <div style={{"display":"flex","flex":"row"}}>
        {(guess.split("")).map((els,index)=>{
          switch (true) {
            case (colors[index] == 1):
              return( <div style={{"background-color":"green"}}>{els}</div>)
              break;
            case (colors[index] == 2):
              return( <div style={{"background-color":"yellow"}}>{els}</div>)
              break;
              
              default:
                return( <div style={{"background-color":"gray"}}>{els}</div>)
                break;
          }
        })}
        </div>
        <h3>{word}</h3>
        <form onSubmit={handleGuess}>
      <label htmlFor="guess"> Adivinar:</label>
      <input type="text" maxLength={ 5} name="guess" id="" placeholder='Solo palabras de 5 letras'/>
      <button > Enviar</button>
    </form>

        </>
  )
}

export default App
