document.addEventListener("DOMContentLoaded", function () {
    const video = document.querySelector("#manutencao video"); // Seleciona o vídeo
    const videoRadio = document.querySelector("#maint2"); // Rádio associado ao slide do vídeo

    if (video && videoRadio) {
        console.log("Configuração do vídeo iniciada...");

        // Adiciona evento para detectar mudança de slide
        videoRadio.addEventListener("change", function () {
            if (videoRadio.checked) {
                video.play(); // Inicia o vídeo quando o rádio do slide for selecionado
            }
        });

        video.addEventListener("play", function () {
            console.log("Vídeo está sendo reproduzido...");
        });

        video.addEventListener("pause", function () {
            console.log("Vídeo pausado.");
        });

        video.addEventListener("ended", function () {
            console.log("Vídeo finalizado.");
        });
    } else {
        console.error("Vídeo ou rádio não encontrados!");
    }
});
