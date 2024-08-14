import React from "react";
import "../css/Sobre.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ToggleMenu from "./ToggleMenu";
import AboutImage from "../image/about-img.png";
const Sobre = () => {
  return (
    <main id="sobre-home" className="sobre-home">
      <ToggleMenu />
      <section className="section-sobre">
        <span className="destaque">Conheça um pouco</span>
        <h1>SOBRE MIM</h1>

        <div class="content-about">
          <div class="content-about-left" data-aos="fade-right">
            <h1>Olá, me chamo Paulo Junior</h1>
            <p>Sou desenvolvedor web freelancer e empreendedor digital. Com mais de 4 anos de experiência, tenho
               um histórico comprovado de transformar ideias em soluções digitais eficazes. Além disso, sou
               criador de conteúdo no TikTok, onde ensino e inspiro pessoas a explorarem o freelancing como uma
               carreira viável ou uma fonte de renda extra.</p>
            <p>Atualmente, estou cursando Engenharia de Software para aprofundar ainda mais meus conhecimentos.
               Se você está buscando um parceiro para levar seu negócio online ao próximo nível, vamos
               conversar!</p>
          </div>
          <div class="content-sobre-right" data-aos="fade-left">
            <div class="img-sobre" id="animatedImage">
              <img src={AboutImage} alt="Imagem"/>
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
