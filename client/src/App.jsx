import { useEffect, useState } from "react";
import io from "socket.io-client";
import wordFunction from "./functions/word";
import "./index.css";
import Confetti from "./functions/confetti";

const socket = io("http://localhost:4000");

function App() {
  const [users, setUsers] = useState([]);

  const [word, setWord] = useState("");

  const [guess, setGuess] = useState("-----");

  const [colors, setColors] = useState([0, 0, 0, 0, 0]);

  const [turn, setTurn] = useState(0);

  const [win, setWin] = useState(false);
  //SOCKETS
  socket.on("newWord", (data) => {
    console.log("se cambió");
    setWord(data);
  });

  socket.on("turno", (num) => {
    setTurn(num);
  });

  socket.on("getUsers", (data) => {
    setUsers(data);
  });

  //FUNCIONES
  const testGuess = (test) => {
    const wordArr = word.split("");
    const guessArr = test.split("");
    setColors(wordFunction(wordArr, guessArr));
  };

  //ADIVINAR
  const handleGuess = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const guess = formData.get("guess");
    socket.emit("newGuess", guess);
  };

  const handleForm = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const alias = formData.get("Username");
    console.log(alias);
    socket.emit("addUser", { id: socket.id, alias });
  };

  socket.on("win", (data) => {
    console.log(data);
    setWin(true);
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
      socket.on("getUsers", (data) => {
        console.log("holiwis");
        setUsers(data);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("lastGuess", (data) => {
      setGuess(data);
      testGuess(data);
    });
  }, [guess]);

  return (
    <>
      <form onSubmit={handleForm}>
        <label htmlFor="Username"> Alias:</label>
        <input type="text" name="Username" id="" placeholder="alias" />
        <button> Ok</button>
      </form>

      <div className="container bg-white shadow-lg h-2/3 p-4 mx-auto w-2/3 rounded-lg justify-items-center ">
        <div className=" w-2/3 rounded-xl bg-slate-100 mb-10">
          <h1 className="text-center text-3xl font-semibold"> USUARIOS</h1>
          <ul className="flex flex-col gap-y-2">
            {users.map((user, index) => {
              return (
                <div key={index} className=" ">
                  <li
                    className={`${
                      index == turn ? "bg-green-200" : "bg-slate-200"
                    } p-2 rounded-lg text-2xl`}
                  >
                    {user.alias}
                  </li>
                </div>
              );
            })}
          </ul>
        </div>
        <div className="flex flex-row gap-x-2">
          {guess.split("").map((els, index) => {
            switch (true) {
              case colors[index] == 1:
                return (
                  <div className="w-10 h-10 bg-green-600 text-3xl text-center rounded-md animate-[bounce_1s_ease-out_3]">
                    {els}
                  </div>
                );
                break;
              case colors[index] == 2:
                return (
                  <div className="w-10 h-10 bg-yellow-600 text-3xl text-center rounded-md">
                    {els}
                  </div>
                );
                break;

              default:
                return (
                  <div className="w-10 h-10 bg-slate-600 text-3xl text-center rounded-md">
                    {els}
                  </div>
                );
                break;
            }
          })}
        </div>
        {/* <h3>{word}</h3> */}
        <form onSubmit={handleGuess}>
          <label htmlFor="guess"> Adivinar:</label>
          <input
            type="text"
            maxLength={5}
            name="guess"
            id=""
            placeholder="Solo palabras de 5 letras"
          />
          <button className="bg-red-400"> Enviar</button>
          {win ? <Confetti /> : <></>}
        </form>
        TURNO: {turn + 1}
      </div>
    </>
  );
}

export default App;
