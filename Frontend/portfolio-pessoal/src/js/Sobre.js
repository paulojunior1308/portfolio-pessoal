import React from "react";
import "../css/responsividade.css"
import "../css/App.css"
import "@fortawesome/fontawesome-free/css/all.min.css";
import ToggleMenu from "./ToggleMenu";
import AboutImage from "../image/about-img.png";
import Curriculo from "../image/arquivos/CV-PauloJunior.pdf"
const Sobre = () => {
  return (
    <main id="sobre-home" className="sobre-home">
      <section className="section-about">
        <ToggleMenu />
        <div className="container-about">
          <div className="headline">
            <span className="destaque">Conheça um pouco</span>
            <h1>SOBRE MIM</h1>
          </div>
          <div className="content-about">
            <div className="content-about-left" data-aos="fade-right">
              <h1>Olá, me chamo Paulo Junior</h1>
              <p>Sou desenvolvedor web freelancer e empreendedor digital. Com mais de 4 anos de experiência, tenho
                um histórico comprovado de transformar ideias em soluções digitais eficazes. Além disso, sou
                criador de conteúdo no TikTok, onde ensino e inspiro pessoas a explorarem o freelancing como uma
                carreira viável ou uma fonte de renda extra.</p>
              <p>Atualmente, estou cursando Engenharia de Software para aprofundar ainda mais meus conhecimentos.
                Se você está buscando um parceiro para levar seu negócio online ao próximo nível, vamos
                conversar!</p>
              <div className="cta-about">
                <div className="btn-about" data-aos="fade-up">

                  <a  href={Curriculo} download="CV-PauloJunior.pdf">
                  <button className="btn">Download CV</button>
                  </a>
                </div>

                <div className="icons-about" data-aos="fade-up">
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
              </div>
            </div>
            <div className="content-about-right" data-aos="fade-left">
              <div className="img-about" id="animatedImage">
                <img src={AboutImage} alt="Imagem"/>
              </div>
            </div>
          </div>
        </div>         
      </section>
      <footer className="sobre-footer">
        <p>Todos os direitos reservados<br />Desenvolvido <span class="sobre-destaque">Paulo Junior│Dev.</span></p>
      </footer>
    </main>
  );
};

export default Sobre;
