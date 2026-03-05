const API = window.location.origin;

// ================== LISTAR NA TABELA (CADASTRO.HTML) ==================
async function listarHospedes() {
  const tabela = document.getElementById("tabela");
  if (!tabela) return;

  try {
    const response = await fetch(`${API}/hospedes`);
    const hospedes = await response.json();
    tabela.innerHTML = "";

    hospedes.forEach(hospede => {
      const idReal = hospede._id || hospede.id;
      
      const acaoHtml = hospede.status.toLowerCase() === 'hospedado' 
        ? `<button onclick="checkout('${idReal}')">Check-out</button>` 
        : 'Finalizado';

      tabela.innerHTML += `
        <tr>
          <td>${hospede.nome}</td>
          <td>${hospede.quarto}</td>
          <td>R$ ${hospede.valor_diaria}</td>
          <td>${hospede.status}</td>
          <td>${acaoHtml}</td>
        </tr>`;
    });
  } catch (error) {
    console.error("Erro ao buscar hóspedes:", error);
  }
}

// ================== CHECKOUT ==================
async function checkout(id) {
  const quantidade_diarias = prompt("Quantas diárias foram consumidas?");
  if (quantidade_diarias === null || quantidade_diarias === "") return;

  try {
    // 1. Faz o Checkout no servidor
    const response = await fetch(`${API}/checkout/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade_diarias: parseInt(quantidade_diarias) })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Check-out realizado!\nTotal pago: R$ ${data.total.toFixed(2)}`);

      // 2. Chama a exclusão após o checkout (Se o seu servidor já não deleta no POST)
      const deleteResponse = await fetch(`${API}/hospedes/${id}`, {
        method: "DELETE"
      });

      if (deleteResponse.ok) {
        // 3. Atualiza a interface
        if (document.getElementById("tabela")) listarHospedes();
        if (document.getElementById("agenda")) listarHospedesAgenda();
      }
    } else {
      alert("Erro no servidor: " + (data.message || data));
    }
  } catch (error) {
    console.error("Erro na comunicação:", error);
    alert("Erro ao conectar com o servidor.");
  }
}

// ================== LISTAR NA AGENDA (INDEX.HTML) ==================
async function listarHospedesAgenda() {
  const agenda = document.getElementById("agenda");
  if (!agenda) return;

  try {
    const response = await fetch(`${API}/hospedes`);
    const hospedes = await response.json();
    agenda.innerHTML = "";

    hospedes.forEach(hospede => {
      if (hospede.status.toLowerCase() === 'hospedado') {
        agenda.innerHTML += `
          <li>
            <strong>${hospede.nome}</strong> - Quarto: ${hospede.quarto}
          </li>`;
      }
    });
  } catch (error) {
    console.error("Erro na agenda:", error);
  }
}

// Inicialização
if (document.getElementById("tabela")) listarHospedes();
if (document.getElementById("agenda")) listarHospedesAgenda();
