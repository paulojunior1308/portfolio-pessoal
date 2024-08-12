import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import particles from './particles';
import './App.css';

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
            <div class="logo">
                <a href="index.html">Paulo Junior Desenvolvedor<span class="destaque">│Dev.</span></a>
            </div>
            <div class="menu-icon">
                <i class="fa-solid fa-bars"></i>
            </div>
            <input type="checkbox" id="toggle" />
                <label class="checkbox" for="toggle">
                    <div class="trace"></div>
                    <div class="trace"></div>
                    <div class="trace"></div>
                </label>
        </div>
    </header>
        <div class="container-home">
            <div class="text-home">
                <h1>Paulo Junior</h1>
                <span>Desenvolvedor <span class="destaque texto-animado"></span></span>
            </div>
            <div class="redes-sociais">
                
            </div>
        </div>
    </main>
      </body>
    </div>
  );
};

export default App;
