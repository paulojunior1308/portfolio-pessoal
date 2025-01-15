import React, { useEffect } from "react";
import AOS from "aos"; // Importando AOS
import "aos/dist/aos.css"; // Importando os estilos do AOS
import "../css/responsividade.css";
import "../css/App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ToggleMenu from "./ToggleMenu";
import Projeto1 from "../image/projeto-bdn.png";
import Projeto2 from "../image/projeto-jrtech.png";
import Projeto3 from "../image/projeto-hugo-bartol.png";
import Css from "../image/css.jpg";
import Java from "../image/java.jpg";
import ReactJs from "../image/react.jpg";
import Spring from "../image/springboot.jpg";
import Javascript from "../image/javascript.jpg";
import Sql from "../image/sql.jpeg";
import Api from "../image/api.jpeg";
import Html from "../image/html5.png";

const Projetos = () => {
  // Inicializando o AOS dentro do useEffect
  useEffect(() => {
    AOS.init({
      duration: 1200, // Duração das animações
    });
  }, []);

  return (
    <main className="projetos">
      <section id="projects" className="projects">
        <ToggleMenu />
        <div className="container-projects">
          <div
            className="headline-project"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <span className="destaque">Veja soluções reais</span>
            <h1>Alguns projetos</h1>
          </div>

          <div className="content-projects">
            <div className="cards-projects">
              <div
                className="card-project"
                data-aos="zoom-in"
                data-aos-delay="150"
              >
                <div className="img-project">
                  <img src={Projeto1} alt="bnd logistics" />
                </div>

                <div className="content-card">
                  <div className="text-project">
                    <h2>JB Queijos e Latícinios</h2>
                    <span>Institucional</span>
                    <p>
                      Sistema para controle de estoque e logística da empresa.
                    </p>
                  </div>
                  <div className="cta-project">
                    <div className="tag-project">
                      <img src={Java} alt="java" />
                      <img src={Spring} alt="spring" />
                      <img src={Sql} alt="sql" />
                      <img src={Api} alt="api" />
                      <img src={Javascript} alt="javascript" />
                      <img src={Css} alt="css" />
                      <img src={ReactJs} alt="react" />
                    </div>
                    <div className="btn-project">
                      <a
                        href="https://controle-estoquesimples.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Acesse o site
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="card-project"
                data-aos="zoom-in"
                data-aos-delay="150"
              >
                <div className="img-project">
                  <img src={Projeto2} alt="jr thecnology solutions" />
                </div>

                <div className="content-card">
                  <div className="text-project">
                    <h2>JR Technology Solutions</h2>
                    <span>Institucional</span>
                    <p>
                    Uma empresa dedicada a oferecer serviços de Tecnologia da Informação, com foco em infraestrutura de rede, configuração de servidores, 
                    equipamentos de rede, computadores, impressoras, além de desenvolvimento de sites e sistemas web.
                    </p>
                  </div>
                  <div className="cta-project">
                    <div className="tag-project">
                      <img src={Html} alt="HTML5" />
                      <img src={Css} alt="CSS3" />
                    </div>
                    <div className="btn-project">
                      <a
                        href="https://jrthecnologysolutions.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Acesse o site
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div
                className="card-project"
                data-aos="zoom-in"
                data-aos-delay="150"
              >
                <div className="img-project">
                  <img src={Projeto3} alt="bnd logistics" />
                </div>
                
                <div className="content-card">
                  <div className="text-project">
                    <h2>BDN Logistics</h2>
                    <span>Institucional</span>
                    <p>
                      Portal multilíngue iluminando o universo da logística com
                      insights, ferramentas de contato e cotação, promovendo
                      interação e soluções globais.
                    </p>
                  </div>
                  <div className="cta-project">
                    <div className="tag-project">
                      <img src={Java} alt="java" />
                      <img src={Spring} alt="spring" />
                    </div>
                    <div className="btn-project">
                      <a
                        href="https://www.bdnlogistics.com.br/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Acesse o site
                      </a>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <footer className="projetos-footer">
        <p>
          Todos os direitos reservados
          <br />
          Desenvolvido{" "}
          <span className="projetos-destaque">Paulo Junior│Dev.</span>
        </p>
      </footer>
    </main>
  );
};

export default Projetos;
