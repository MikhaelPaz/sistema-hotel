// Usa automaticamente o domínio atual (funciona local e online)
const API = window.location.origin;

// ================== CADASTRAR ==================
async function cadastrar() {
  const nome = document.getElementById("nome").value;
  const quarto = document.getElementById("quarto").value;
  const valor_diaria = document.getElementById("valor_diaria").value;

  if (!nome || !quarto || !valor_diaria) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch(`${API}/cadastrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        quarto,
        valor_diaria
      })
    });

    const data = await response.json();
    alert(data.message);

    window.location.href = "index.html";

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar!");
  }
}

// ================== LISTAR HÓSPEDES ==================
async function listarHospedes() {
  try {
    const response = await fetch(`${API}/hospedes`);
    const hospedes = await response.json();

    const tabela = document.getElementById("tabela");
    tabela.innerHTML = "";

    hospedes.forEach(hospede => {
      tabela.innerHTML += `
        <tr>
          <td>${hospede.nome}</td>
          <td>${hospede.quarto}</td>
          <td>R$ ${hospede.valor_diaria}</td>
          <td>${hospede.status}</td>
        </tr>
        ${hospede.status === 'ativo' ? `<button onclick="checkout(${hospede.id})">Check-out</button>` : 'Finalizado'}

      `;
    });

  } catch (error) {
    console.error("Erro ao buscar hóspedes:", error);
  }
}

// ================== CHECKOUT ==================
async function checkout(id) {
  try {
    const response = await fetch(`${API}/checkout/${id}`, {
      method: "PUT"
    });

    const data = await response.json();
    alert(data.message);

    listarHospedes();

  } catch (error) {
    console.error("Erro no checkout:", error);
  }
}

// Carrega hóspedes ao abrir página principal
if (document.getElementById("tabela")) {
  listarHospedes();
}
