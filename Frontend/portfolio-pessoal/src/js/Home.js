import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import particlesOptions from "./particles";
import { loadSlim } from "tsparticles-slim";
import "../css/App.css";
import "../css/responsividade.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import TypingAnimation from "./textAnimation";
import ToggleMenu from "./ToggleMenu";

const Home = () => {
  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    await loadSlim(engine);
  }, []);

  const particlesLoad = useCallback(async (container) => {
    await console.log(container);
  }, []);

  return (
    <div className="App">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoad}
        options={particlesOptions}
      />
      <main id="home" className="home">
        <ToggleMenu />
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
          <div className="icons-home">
            <a
              href="https://www.linkedin.com/in/paulojr-itsupport/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="layer linkedin">
                <span className="fab fa-linkedin"></span>
              </div>
            </a>
            <a
              href="https://github.com/paulojunior1308"
              target="_blank"
              rel="noreferrer"
            >
              <div className="layer github">
                <span className="fab fa-github"></span>
              </div>
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
