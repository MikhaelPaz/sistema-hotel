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
      // Verificamos o status e já criamos o HTML do botão ou do texto
      // Convertemos para minúsculo para evitar erro de "Ativo" vs "ativo"
      const acaoHtml = hospede.status.toLowerCase() === 'hospedado' 
        ? `<button onclick="checkout(${hospede.id || hospede._id})">Check-out</button>` 
        : 'Finalizado';

      tabela.innerHTML += `
        <tr>
          <td>${hospede.nome}</td>
          <td>${hospede.quarto}</td>
          <td>R$ ${hospede.valor_diaria}</td>
          <td>${hospede.status}</td>
          <td>${acaoHtml}</td>
        </tr>
      `;
    });

  } catch (error) {
    console.error("Erro ao buscar hóspedes:", error);
  }
}

// ================== CHECKOUT ==================
async function checkout(id) {
  // 1. Pergunta a quantidade de diárias
  const quantidade_diarias = prompt("Quantas diárias foram consumidas?");

  // Cancela se o usuário não digitar nada ou cancelar o prompt
  if (quantidade_diarias === null || quantidade_diarias === "") return;

  try {
    const response = await fetch(`${API}/checkout/${id}`, {
      method: "POST", // Alinhado com o seu app.post do servidor
      headers: {
        "Content-Type": "application/json"
      },
      // 2. Envia a quantidade no corpo da requisição
      body: JSON.stringify({
        quantidade_diarias: parseInt(quantidade_diarias)
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Check-out realizado!\nTotal a pagar: R$ ${data.total.toFixed(2)}`);
      listarHospedes();
    } else {
      alert("Erro no servidor: " + data);
    }

  } catch (error) {
    console.error("Erro no checkout:", error);
    alert("Erro na comunicação com o servidor.");
  }
}

// Carrega hóspedes ao abrir página principal
if (document.getElementById("tabela")) {
  listarHospedes();
}

// Colocar hospedes na agenda do index
async function listarHospedesAgenda() {
  try {
    const response = await fetch(`${API}/hospedes`);
    const hospedes = await response.json();

    const agenda = document.getElementById("agenda");
    agenda.innerHTML = "";

    hospedes.forEach(hospede => {
      // Criamos a lista simplificada para a agenda
      agenda.innerHTML += `
        <li>
          <strong>${hospede.nome}</strong> - Quarto: ${hospede.quarto} 
          (${hospede.status})
        </li>
      `;
    });
  } catch (error) {
    console.error("Erro ao buscar hóspedes para agenda:", error);
  }
}