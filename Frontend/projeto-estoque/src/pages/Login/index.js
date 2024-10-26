import React, { useState } from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

function LoginInteractive() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();

    const data = {
      username,
      password,
    };

    console.log(username)
    try {
      const response = await api.post("auth/signin", data);

      localStorage.setItem("username", username);

      const token = response.data.token || response.data.accessToken;
      localStorage.setItem("accessToken", token);

      navigate("/home");
    } catch (error) {
      alert("Usuário ou senha inválidos");
    }
  }
  return (
    <div className="login">
      <section>
        <form onSubmit={login}>
          <h1>Login</h1>
          <div className="inputbox">
            <ion-icon className="mail-outline"></ion-icon>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Usuario</label>
          </div>
          <div className="inputbox">
            <ion-icon className="lock-closed-outline"></ion-icon>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Senha</label>
          </div>
          <button>Entrar</button>
        </form>
      </section>
    </div>
  );
}

export default LoginInteractive;
