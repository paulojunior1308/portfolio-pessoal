import React from "react";
import "./Login.css";

function LoginInteractive() {
  return (
    <section>
      <form>
        <h1>Login</h1>
        <div className="inputbox">
          <ion-icon className="mail-outline"></ion-icon>
          <input type="email" required />
          <label>E-mail</label>
        </div>
        <div className="inputbox">
          <ion-icon className="lock-closed-outline"></ion-icon>
          <input type="password" required />
          <label>Senha</label>
        </div>
        <button>Entrar</button>
      </form>
    </section>
  );
}

export default LoginInteractive;
