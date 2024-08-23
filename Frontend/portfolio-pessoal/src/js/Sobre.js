import React, { useEffect } from "react";
import AOS from "aos"; // Importando AOS
import "aos/dist/aos.css"; // Importando os estilos do AOS
import "../css/responsividade.css";
import "../css/App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ToggleMenu from "./ToggleMenu";
import AboutImage from "../image/about-img.jpeg";
import Css from "../image/css.jpg";
import Java from "../image/java.jpg";
import ReactJs from "../image/react.jpg";
import Spring from "../image/springboot.jpg";
import Javascript from "../image/javascript.jpg";
import Sql from "../image/sql.jpeg";
import Api from "../image/api.jpeg";
import Curriculo from "../image/arquivos/CV-PauloJunior.pdf";

const Sobre = () => {
  // Inicializando o AOS dentro do useEffect
  useEffect(() => {
    AOS.init({
      duration: 1200, // Duração das animações
    });
  }, []);

  // Mensagem whatsapp
  const phoneNumber = "5511949885625"; // Substitua pelo seu número de telefone
  const message = "Olá, gostaria de saber mais sobre seus serviços!"; // Mensagem padrão
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <main id="sobre-home" className="sobre-home">
      <section className="section-about">
        <ToggleMenu />
        <div className="container-about">
          <div className="headline" data-aos="fade-down">
            <span className="destaque">Conheça um pouco</span>
            <h1>SOBRE MIM</h1>
          </div>
          <div className="content-about">
            <div className="content-about-left" data-aos="fade-right">
              <h1>Olá, me chamo Paulo Junior</h1>
              <p>
                Sou formado em Ciências da Computação com uma pós-graduação em
                Segurança da Informação. Atualmente, estou em um processo de
                transição para a área de desenvolvimento de software, focando
                principalmente em Java e Spring Boot. Tenho experiência
                acadêmica sólida e estou ampliando meus conhecimentos práticos,
                estudando também React e CSS para criar aplicações web modernas
                e interativas.
              </p>
              <p>
                Estou desenvolvendo este portfólio para demonstrar minhas
                habilidades e projetos, enquanto busco oportunidades para
                ingressar no mercado de trabalho como desenvolvedor. Estou
                motivado a aplicar minha paixão por tecnologia e meu compromisso
                com a aprendizagem contínua para criar soluções eficientes e
                seguras. Meu objetivo é crescer na área de desenvolvimento,
                contribuindo com projetos desafiadores e inovadores.
              </p>
              <div className="cta-about">
                <div className="btn-about" data-aos="fade-down">
                  <a href={Curriculo} download="CV-PauloJunior.pdf">
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
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <div className="layer whatsapp">
                      <span className="fab fa-whatsapp"></span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className="content-about-right" data-aos="fade-right">
              <div className="img-about" id="animatedImage">
                <img src={AboutImage} alt="Imagem" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="skills" className="skills">
        <div className="container-skills">
          <div className="skills-headline" data-aos="fade-down">
            <span className="destaque">Conheça um pouco minhas</span>
            <h1>Habilidades</h1>
            <p>
              Minha formação acadêmica é voltada para a Segurança da Informação,
              onde adquiri conhecimentos sólidos em criptografia, legislação,
              normas de segurança e identificação de vulnerabilidades. Agora,
              estou direcionando meus esforços para a área de desenvolvimento de
              software, especialmente em Java e Spring Boot, com o objetivo de
              expandir minhas habilidades e me tornar um desenvolvedor versátil.
              Embora meu conhecimento em desenvolvimento ainda esteja em
              crescimento, estou empenhado em aprender e aplicar práticas de
              programação modernas. Minha experiência prévia em suporte técnico,
              junto com a forte base em segurança, me fornece uma perspectiva
              única para criar soluções de software que são tanto funcionais
              quanto seguras.
            </p>
            <div className="list-about" data-aos="fade-up">
              <span className="destaque">Soft skills</span>
              <div className="container-list">
                <ul>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Comunicação
                  </li>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Colaboração
                  </li>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Resolução
                  </li>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Adaptabilidade
                  </li>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Pontualidade
                  </li>
                </ul>
                <ul>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Detalhismo
                  </li>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Crítica
                  </li>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Criatividade
                  </li>
                  <li>
                    <i className="fa-solid fa-angles-right"></i> Autodidatismo
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="skills-info">
            <div className="card-tech" data-aos="zoom-in">
              <img src={Css} alt="CSS" />
              <p>CSS</p>
            </div>
            <div className="card-tech" data-aos="zoom-in">
              <img src={Javascript} alt="JavaScript" />
              <p>JavaScript</p>
            </div>
            <div className="card-tech" data-aos="zoom-in">
              <img src={ReactJs} alt="React" />
              <p>React</p>
            </div>
            <div className="card-tech" data-aos="zoom-in">
              <img src={Java} alt="Java" />
              <p>Java</p>
            </div>
            <div className="card-tech" data-aos="zoom-in">
              <img src={Spring} alt="Springboot" />
              <p>Springboot</p>
            </div>
            <div className="card-tech" data-aos="zoom-in">
              <img src={Sql} alt="Sql" />
              <p>SQL</p>
            </div>
            <div className="card-tech" data-aos="zoom-in">
              <img src={Api} alt="Api" />
              <p>Rest API</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="sobre-footer">
        <p>
          Todos os direitos reservados
          <br />
          Desenvolvido <span className="sobre-destaque">Paulo Junior│Dev.</span>
        </p>
      </footer>
    </main>
  );
};

export default Sobre;
