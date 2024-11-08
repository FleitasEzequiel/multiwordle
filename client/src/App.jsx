import { useEffect, useState } from 'react'
import io from "socket.io-client"
import './style.css'

const socket = io("http://localhost:4000")

function App() {
  const [word, setWord] = useState()
  const [time, setTime] = useState(0)
  
  const updateUsers = () =>{
    socket.on("getUsers",(userList)=>{
      setUsers(userList)
    })
  }

  const handleGuess = (e) =>{
    e.preventDefault()
    const formData = new FormData(e.target)
    const guess = formData.get("guess")
    socket.emit("newGuess",guess)
  }

  socket.on("newWord",(data)=>{
    setWord(data)
    setTime(10)
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
    setTime(10)
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
        <h1>{word}</h1>
        <form onSubmit={handleGuess}>
      <label htmlFor="guess"> Adivinar:</label>
      <input type="text" maxLength={ 5} name="guess" id="" placeholder='Solo palabras de 5 letras'/>
      <button  > Enviar</button>
    </form>
        </>
  )
}

export default App
