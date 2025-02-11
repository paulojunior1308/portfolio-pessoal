import React from 'react';
import '../styles/Home.css';

const Home = () => {
  const features = [
    {
      title: "Qualidade Premium",
      description: "Seleção criteriosa dos melhores produtos lácteos"
    },
    {
      title: "Tradição Artesanal",
      description: "Processos tradicionais que preservam o sabor autêntico"
    },
    {
      title: "Entrega Garantida",
      description: "Compromisso com a satisfação dos nossos clientes"
    }
  ];

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">JB Frios e Laticínios</h1>
        <p className="home-subtitle">
          Descubra o sabor autêntico dos melhores queijos artesanais
        </p>
      </div>

      <div className="home-features">
        {features.map((feature, index) => (
          <div key={index} className="home-feature-card">
            <h3 className="home-feature-title">{feature.title}</h3>
            <p className="home-feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
