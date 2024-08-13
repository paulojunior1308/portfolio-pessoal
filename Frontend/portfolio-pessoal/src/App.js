import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import particlesOptions from './particles';
import { loadSlim } from "tsparticles-slim";
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {

  const particlesInit = useCallback(async engine => {
    console.log(engine);
    await loadSlim(engine);
  }, []);

  const particlesLoad = useCallback(async container => {
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
        <header id="header" className="header">
          <div className="container-header">
            <input type="checkbox" id="toggle" />
            <label className="checkbox" htmlFor="toggle">
              <div className="trace"></div>
              <div className="trace"></div>
              <div className="trace"></div>
            </label>
          </div>
        </header>
        <section className="text-home">
          <h1>Paulo Junior</h1>
          <h2>Desenvolvedor</h2>
          <div className='icons'>
            <a href='https://github.com/paulojunior1308' target='_blank' rel='noreferrer'>
              <div className='layer linkedin'>
                <span className='fab fa-linkedin'></span>
              </div>
              <div className='text'>Linkedin</div>
            </a>
            <a href='https://www.linkedin.com/in/paulojr-itsupport/' target='_blank' rel='noreferrer'>
              <div className='layer github'>
                <span className='fab fa-github'></span>
              </div>
              <div className='text'>Github</div>
            </a>
          </div>
        </section>
        <footer className="footer">
          <p>© 2024 - Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
