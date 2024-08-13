import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import particles from './particles';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <div className="App">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particles}
      />
      <body>
        <main id="home" class="home">
          
          <header id="header" class="header">
              <div class="container-header">
                  <input type="checkbox" id="toggle" />
                      <label class="checkbox" for="toggle">
                          <div class="trace"></div>
                          <div class="trace"></div>
                          <div class="trace"></div>
                      </label>
              </div>
          </header>
          <section class="text-home">
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
          <footer class="footer">
              <p>© 2024 - Todos os direitos reservados.</p>
          </footer>     
              
        </main>
      </body>
    </div>
  );
};

export default App;
