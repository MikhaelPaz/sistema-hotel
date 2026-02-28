const API = "http://localhost:3000";

// DASHBOARD
if (document.getElementById("ativos")) {

    fetch(API + "/hospedes")
        .then(res => res.json())
        .then(data => {
            const ativos = data.filter(h => h.status === "hospedado");
            document.getElementById("ativos").innerText = ativos.length;

            const agenda = document.getElementById("agenda");
            agenda.innerHTML = "";

            ativos.forEach(h => {
                agenda.innerHTML += `<li>Quarto ${h.quarto} - ${h.nome}</li>`;
            });
        });

    fetch(API + "/faturamento")
        .then(res => res.json())
        .then(data => {
            document.getElementById("faturamento").innerText =
                "R$ " + Number(data.total).toFixed(2);
        });
}

// CADASTRO
function cadastrar() {
    const nome = document.getElementById("nome").value;
    const quarto = document.getElementById("quarto").value;
    const valor = document.getElementById("valor").value;

    fetch(API + "/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome,
            quarto,
            valor_diaria: valor
        })
    }).then(() => location.reload());
}

// LISTAR NA PÁGINA CADASTRO
if (document.getElementById("lista")) {

    fetch(API + "/hospedes")
        .then(res => res.json())
        .then(data => {

            const lista = document.getElementById("lista");
            lista.innerHTML = "";

            // 🔹 Mostrar apenas hóspedes ativos
            const ativos = data.filter(h => h.status === "hospedado");

            ativos.forEach(h => {
                lista.innerHTML += `
                <li>
                    ${h.nome} - Quarto ${h.quarto}
                    <button onclick="checkout(${h.id})">Check-out</button>
                </li>`;
            });
        });
}

function checkout(id) {
    const diarias = prompt("Quantidade de diárias:");

    if (!diarias || diarias <= 0) {
        alert("Quantidade inválida!");
        return;
    }

    fetch(API + "/checkout/" + id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            quantidade_diarias: diarias
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Valor total a pagar: R$ " + Number(data.total).toFixed(2));
        location.reload();
    });
}
// limpar faturamento mensal
function limparFaturamento() {

    const confirmar = confirm("Tem certeza que deseja zerar o faturamento mensal?");

    if (!confirmar) return;

    fetch(API + "/limpar-faturamento", {
        method: "POST"
    })
    .then(() => {
        alert("Faturamento mensal zerado com sucesso!");
        location.reload();
    });
}