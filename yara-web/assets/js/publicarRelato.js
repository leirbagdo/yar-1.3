
let relatos = JSON.parse(localStorage.getItem("relatosYara")) || [];

function carregarRelatos() {
    const feed = document.getElementById("feedRelatos");

    feed.innerHTML = "";

    relatos.forEach(relato => {
        feed.innerHTML += `
            <div class="quote-card glass card-hover-effect">
                <i class="fas fa-quote-left"></i>

                <p class="quote-text">
                    "${relato.texto}"
                </p>

                <div class="quote-author">
                    <div class="author-img">
                        ${relato.autor.substring(0,2).toUpperCase()}
                    </div>

                    <div class="author-info">
                        <h4>${relato.autor}</h4>
                        <p>${relato.data}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

function publicarRelato() {
    const texto = document.getElementById("novoRelato").value;

    if(texto.trim() === "") {
        alert("Escreva um relato antes de publicar.");
        return;
    }

    const autor = prompt("Qual é o seu nome?");

    if(!autor) return;

    relatos.unshift({
        texto: texto,
        autor: autor,
        data: new Date().toLocaleDateString("pt-BR")
    });

    localStorage.setItem(
        "relatosYara",
        JSON.stringify(relatos)
    );

    document.getElementById("novoRelato").value = "";

    carregarRelatos();
}

carregarRelatos();