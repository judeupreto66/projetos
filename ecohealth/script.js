// ==========================
// LOGIN REAL LOCALSTORAGE
// ==========================

function login() {

    const email =
        document.getElementById("user")?.value;

    const senha =
        document.getElementById("pass")?.value;

    const msg =
        document.getElementById("msg");

    let usuarios =
        JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuario = usuarios.find(
        u =>
            u.email === email &&
            u.senha === senha
    );

    if (usuario) {

        localStorage.setItem("logado", "true");

        localStorage.setItem(
            "usuarioAtual",
            JSON.stringify(usuario)
        );

        mostrarToast(
            `Bem-vindo, ${usuario.nome}!`
        );

        setTimeout(() => {

            trocarPagina("home.html");
        }, 1200);

    } else {

        if (msg) {

            msg.innerText =
                "Email ou senha incorretos";

            msg.style.color = "red";
        }

        mostrarToast(
            "Email ou senha incorretos."
        );
    }
}

// ==========================
// CADASTRO LOCAL
// ==========================

function cadastrar() {

    const nome =
        document.getElementById("nome").value;

    const email =
        document.getElementById("email").value;

    const senha =
        document.getElementById("senha").value;

    if (!nome || !email || !senha) {

        mostrarToast("Preencha todos os campos");

        return;
    }

    // pegar usuários salvos
    let usuarios =
        JSON.parse(localStorage.getItem("usuarios")) || [];

    // verificar email existente
    const existe = usuarios.find(
        u => u.email === email
    );

    if (existe) {

        mostrarToast("Email já cadastrado");

        return;
    }

    // novo usuário
    const novoUsuario = {
        nome,
        email,
        senha
    };

    usuarios.push(novoUsuario);

    // salvar
    localStorage.setItem(
        "usuarios",
        JSON.stringify(usuarios)
    );

    mostrarToast("Conta criada com sucesso!");

    setTimeout(() => {

        trocarPagina("index.html");
    }, 800);
}

// ==========================
// PROTEÇÃO DE ROTA
// ==========================

if (window.location.pathname.includes("home.html")) {

    if (!localStorage.getItem("logado")) {

        trocarPagina("index.html");
    }
}

// ==========================
// TOAST ALERTAS
// ==========================

function mostrarToast(mensagem) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.innerText = mensagem;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}

// ==========================
// MAPA
// ==========================

if (document.getElementById("map")) {

    let denuncias =
        JSON.parse(localStorage.getItem("denuncias")) || [];

    let imagemBase64 = "";

    // ==========================
    // PREVIEW IMAGEM
    // ==========================

    const inputImagem =
        document.getElementById("imagem");

    if (inputImagem) {

        inputImagem.addEventListener("change", function () {

            const arquivo = this.files[0];

            if (!arquivo) return;

            const reader = new FileReader();

            reader.onload = function (e) {

                imagemBase64 = e.target.result;

                const preview =
                    document.getElementById("preview");

                preview.src = imagemBase64;

                preview.style.display = "block";

                mostrarToast("Imagem carregada.");
            };

            reader.readAsDataURL(arquivo);
        });
    }

    // ==========================
    // MAPA BRASIL
    // ==========================

    window.map = L.map('map').setView(
        [-14.23, -51.92],
        5
    );

    const brasilBounds = [
        [-33.75, -73.98],
        [5.27, -34.79]
    ];

    map.setMaxBounds(brasilBounds);

    map.on('drag', function () {

        map.panInsideBounds(
            brasilBounds,
            { animate: false }
        );
    });

    map.setMinZoom(4);
    map.setMaxZoom(18);

    // ==========================
    // CAMADA MAPA
    // ==========================

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '© OpenStreetMap'
        }
    ).addTo(map);

    // ==========================
    // RENDERIZAR DENÚNCIAS
    // ==========================

    function renderizarMapa() {

        denuncias.forEach(d => {

            if (d.lat && d.lon) {

                L.marker([d.lat, d.lon])

                    .addTo(map)

                    .bindPopup(`

                        <div class="popup-content">

                            <h3>📍 Denúncia</h3>

                            <p>
                                <strong>Local:</strong><br>
                                ${d.local}
                            </p>

                            <p>
                                <strong>Descrição:</strong><br>
                                ${d.descricao}
                            </p>

                            ${
                                d.imagem
                                ? `
                                    <img
                                        src="${d.imagem}"
                                        class="popup-img"
                                    >
                                `
                                : ""
                            }

                        </div>
                    `);
            }
        });
    }

    // ==========================
    // BUSCAR ENDEREÇO
    // ==========================

    window.buscarEndereco = function() {

        const endereco =
            document.getElementById("buscarEndereco").value;

        if (!endereco) {

            mostrarToast("Digite um endereço.");

            return;
        }

        fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`
        )

        .then(res => res.json())

        .then(data => {

            if (data.length === 0) {

                mostrarToast("Endereço não encontrado.");

                return;
            }

            const resultado = data[0];

            const lat = parseFloat(resultado.lat);
            const lon = parseFloat(resultado.lon);

            window.latAtual = lat;
            window.lonAtual = lon;

            map.setView([lat, lon], 16);

            L.marker([lat, lon])

                .addTo(map)

                .bindPopup(resultado.display_name)

                .openPopup();

            document.getElementById("local").value =
                resultado.display_name;

            mostrarToast("Endereço encontrado.");
        })

        .catch(() => {

            mostrarToast("Erro ao buscar endereço.");
        });
    }

    // ==========================
    // CLIQUE NO MAPA
    // ==========================

    map.on("click", function(e) {

        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        window.latAtual = lat;
        window.lonAtual = lon;

        fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        )

        .then(res => res.json())

        .then(data => {

            const endereco =
                data.display_name ||
                "Endereço não encontrado";

            document.getElementById("local").value =
                endereco;

            L.marker([lat, lon])

                .addTo(map)

                .bindPopup(`<b>${endereco}</b>`)

                .openPopup();

            mostrarToast("Local selecionado.");
        })

        .catch(() => {

            mostrarToast("Erro ao buscar endereço.");
        });
    });

    // ==========================
    // ENVIAR DENÚNCIA
    // ==========================

    document
        .getElementById("form")

        ?.addEventListener("submit", function(e) {

            e.preventDefault();

            const local =
                document.getElementById("local").value;

            const descricao =
                document.getElementById("descricao").value;

            if (!window.latAtual || !window.lonAtual) {

                mostrarToast("Selecione um local no mapa.");

                return;
            }

            const nova = {

                local,
                descricao,

                imagem: imagemBase64,

                lat: window.latAtual || null,
                lon: window.lonAtual || null
            };

            denuncias.push(nova);

            localStorage.setItem(
                "denuncias",
                JSON.stringify(denuncias)
            );

            mostrarToast("Denúncia enviada com sucesso!");

            setTimeout(() => {
                location.reload();
            }, 1500);
        });

    // ==========================
    // GEOLOCALIZAÇÃO
    // ==========================

    window.usarLocalizacao = function() {

        navigator.geolocation.getCurrentPosition(pos => {

            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            window.latAtual = lat;
            window.lonAtual = lon;

            fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            )

            .then(res => res.json())

            .then(data => {

                const endereco =
                    data.display_name ||
                    "Sua localização";

                document.getElementById("local").value =
                    endereco;

                map.setView([lat, lon], 15);

                L.marker([lat, lon])

                    .addTo(map)

                    .bindPopup("Sua localização")

                    .openPopup();

                mostrarToast("Localização carregada.");
            });

        }, () => {

            mostrarToast("Erro ao acessar localização.");
        });
    };

    renderizarMapa();

    // ==========================
    // HEATMAP
    // ==========================

    function criarHeatmap() {

        const pontos = [];

        denuncias.forEach(d => {

            if (d.lat && d.lon) {

                pontos.push([
                    d.lat,
                    d.lon,
                    1
                ]);
            }
        });

        if (pontos.length > 0) {

            L.heatLayer(pontos, {

                radius: 30,
                blur: 20,
                maxZoom: 17

            }).addTo(map);
        }
    }

    criarHeatmap();
}

// ==========================
// AGENTES
// ==========================
function toggleAgentes() {

    const conteudo =
        document.getElementById("agentesConteudo");

    if (!conteudo) return;

    if (
        conteudo.style.display === "none" ||
        conteudo.style.display === ""
    ) {

        conteudo.style.display = "grid";

        setTimeout(() => {

            conteudo.classList.add("mostrar");

        }, 10);

    } else {

        conteudo.classList.remove("mostrar");

        setTimeout(() => {

            conteudo.style.display = "none";

        }, 400);
    }
}

// ==========================
// DASHBOARD
// ==========================

function atualizarDashboard() {

    const denuncias =
        JSON.parse(localStorage.getItem("denuncias")) || [];

    let agua = 0;
    let ar = 0;
    let residuos = 0;

    denuncias.forEach(d => {

        const texto = (
            d.descricao +
            " " +
            d.local
        ).toLowerCase();

        if (
            texto.includes("agua") ||
            texto.includes("dengue") ||
            texto.includes("mosquito")
        ) {
            agua++;
        }

        if (
            texto.includes("ar") ||
            texto.includes("fumaca") ||
            texto.includes("poluição")
        ) {
            ar++;
        }

        if (
            texto.includes("lixo") ||
            texto.includes("resíduo")
        ) {
            residuos++;
        }
    });

    if (document.getElementById("totalDenuncias")) {

        document.getElementById("totalDenuncias")
            .innerText = denuncias.length;
    }

    if (document.getElementById("totalAgua")) {

        document.getElementById("totalAgua")
            .innerText = agua;
    }

    if (document.getElementById("totalAr")) {

        document.getElementById("totalAr")
            .innerText = ar;
    }

    if (document.getElementById("totalResiduos")) {

        document.getElementById("totalResiduos")
            .innerText = residuos;
    }
}

atualizarDashboard();

// ==========================
// DARK MODE
// ==========================

const themeToggle =
    document.getElementById("themeToggle");

if (localStorage.getItem("darkMode") === "true") {

    document.body.classList.add("dark");

    if (themeToggle) {

        themeToggle.innerText = "☀️";
    }
}

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const darkAtivo =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "darkMode",
            darkAtivo
        );

        themeToggle.innerText =
            darkAtivo
            ? "☀️"
            : "🌙";
    });
}

// ==========================
// GRÁFICO
// ==========================

function criarGrafico() {

    const canvas =
        document.getElementById("graficoDenuncias");

    if (!canvas) return;

    const denuncias =
        JSON.parse(localStorage.getItem("denuncias")) || [];

    let agua = 0;
    let ar = 0;
    let residuos = 0;
    let queimadas = 0;

    denuncias.forEach(d => {

        const texto = (
            d.descricao +
            " " +
            d.local
        ).toLowerCase();

        if (
            texto.includes("agua") ||
            texto.includes("dengue") ||
            texto.includes("mosquito")
        ) {
            agua++;
        }

        if (
            texto.includes("ar") ||
            texto.includes("fumaca") ||
            texto.includes("poluição")
        ) {
            ar++;
        }

        if (
            texto.includes("lixo") ||
            texto.includes("resíduo")
        ) {
            residuos++;
        }

        if (
            texto.includes("queimada") ||
            texto.includes("incendio")
        ) {
            queimadas++;
        }
    });

    new Chart(canvas, {

        type: 'bar',

        data: {

            labels: [
                'Água',
                'Poluição do Ar',
                'Resíduos',
                'Queimadas'
            ],

            datasets: [{

                label: 'Quantidade de denúncias',

                data: [
                    agua,
                    ar,
                    residuos,
                    queimadas
                ],

                borderWidth: 2,
                borderRadius: 10
            }]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {

                        color:
                            document.body.classList.contains("dark")
                            ? "white"
                            : "black"
                    }
                }
            },

            scales: {

                y: {

                    ticks: {

                        color:
                            document.body.classList.contains("dark")
                            ? "white"
                            : "black"
                    }
                },

                x: {

                    ticks: {

                        color:
                            document.body.classList.contains("dark")
                            ? "white"
                            : "black"
                    }
                }
            }
        }
    });
}

criarGrafico();

function trocarPagina(url) {

    document.body.classList.add("fade-out");

    setTimeout(() => {

        window.location.href = url;

    }, 400);
}
// ==========================
// TRANSIÇÃO DE PÁGINA
// ==========================

function trocarPagina(url) {

    document.body.classList.add("fade-out");

    setTimeout(() => {

        window.location.href = url;

    }, 350);
}
// ==========================
// LOGOUT
// ==========================

function logout() {

    localStorage.removeItem("logado");

    localStorage.removeItem("usuarioAtual");

    mostrarToast("Logout realizado!");

    setTimeout(() => {

        window.location.href = "index.html";

    }, 1000);
}
// ==========================
// MOSTRAR / ESCONDER PROBLEMAS
// ==========================

function toggleProblemas() {

    const conteudo =
        document.getElementById("problemasConteudo");

    if (!conteudo) return;

    if (
        conteudo.style.display === "none" ||
        conteudo.style.display === ""
    ) {

        conteudo.style.display = "grid";

        setTimeout(() => {

            conteudo.classList.add("mostrar");

        }, 10);

    } else {

        conteudo.classList.remove("mostrar");

        setTimeout(() => {

            conteudo.style.display = "none";

        }, 400);
    }
}
// ==========================
// CONSCIENTIZAÇÃO
// ==========================

function toggleConscientizacao() {

    const conteudo =
        document.getElementById("conscientizacaoConteudo");

    if (!conteudo) return;

    if (
        conteudo.style.display === "none" ||
        conteudo.style.display === ""
    ) {

        conteudo.style.display = "grid";

        setTimeout(() => {

            conteudo.classList.add("mostrar");

        }, 10);

    } else {

        conteudo.classList.remove("mostrar");

        setTimeout(() => {

            conteudo.style.display = "none";

        }, 400);
    }
}

