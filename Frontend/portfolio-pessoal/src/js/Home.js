import React, { useCallback, useState } from "react";
import Particles from "react-tsparticles";
import particlesOptions from "./particles";
import { loadSlim } from "tsparticles-slim";
import "../css/App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import TypingAnimation from "./textAnimation";
import { Link } from 'react-router-dom'; 

const Home = () => {
  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    await loadSlim(engine);
  }, []);

  const particlesLoad = useCallback(async (container) => {
    await console.log(container);
  }, []);

  const [isChecked, setIsChecked] = useState(false);

  const handleToggleChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="App">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoad}
        options={particlesOptions}
      />
      <main id="home" className="home">
        <header id="header" className="header">
          <div className="logo">
            <a href="index.html">
              Paulo Junior <span className="destaque">│Dev.</span>
            </a>
          </div>
          <div className="checkbox-container">
            <div className="checkbox-wrapper">
              <input type="checkbox" id="toggle" checked={isChecked} onChange={handleToggleChange} />
              <label className="checkbox" for="toggle">
                <div className="trace"></div>
                <div className="trace"></div>
                <div className="trace"></div>
              </label>
              <div className={`menu ${isChecked ? 'open' : ''}`}></div>
              <nav className={`menu-items ${isChecked ? 'open' : ''}`}>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/sobre">Sobre</Link></li>
                  <li><Link to="/projetos">Projetos</Link></li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <section className="text-home">
          <h1>Paulo Junior</h1>
          <h2>
            Desenvolvedor{" "}
            <span className="destaque texto-animado">
              {" "}
              <TypingAnimation
                words={["Criativo", "Web", "Java"]}
                speed={100}
                eraseSpeed={150}
                delay={1000}
              />{" "}
            </span>
          </h2>
        </section>
        <footer className="footer">
          <div className="icons">
            <a
              href="https://www.linkedin.com/in/paulojr-itsupport/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="layer linkedin">
                <span className="fab fa-linkedin"></span>
              </div>
              <div className="text">Linkedin</div>
            </a>
            <a
              href="https://github.com/paulojunior1308"
              target="_blank"
              rel="noreferrer"
            >
              <div className="layer github">
                <span className="fab fa-github"></span>
              </div>
              <div className="text">Github</div>
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;