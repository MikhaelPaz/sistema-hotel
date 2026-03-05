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
      const idReal = hospede._id || hospede.id; // Suporta MongoDB e outros
      
      // IMPORTANTE: aspas simples '${idReal}' para IDs com letras não quebrarem
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
  // Cancela se o usuário não digitar nada
  if (quantidade_diarias === null || quantidade_diarias === "") return;

  try {
    // 1. Faz o Checkout no servidor (para calcular o valor e mudar status se necessário)
    const response = await fetch(`${API}/checkout/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade_diarias: parseInt(quantidade_diarias) })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Check-out realizado!\nTotal pago: R$ ${data.total.toFixed(2)}`);

<<<<<<< HEAD
      // Atualiza a interface (como o banco já deletou, ele vai sumir da lista)
      if (document.getElementById("tabela")) listarHospedes();
      if (document.getElementById("agenda")) listarHospedesAgenda();
      
=======
      // 2. AGORA APAGA DO BANCO DE DADOS
      const deleteResponse = await fetch(`${API}/hospedes/${id}`, {
        method: "DELETE"
      });

      if (deleteResponse.ok) {
        // 3. Atualiza a interface (Agenda ou Tabela) conforme a página atual
        if (document.getElementById("tabela")) listarHospedes();
        if (document.getElementById("agenda")) listarHospedesAgenda();
      }
>>>>>>> 8fb4781 (deletar)
    } else {
      alert("Erro ao processar checkout: " + (data.message || data));
    }
  } catch (error) {
<<<<<<< HEAD
    console.error("Erro na requisição:", error);
=======
    console.error("Erro na comunicação:", error);
>>>>>>> 8fb4781 (deletar)
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
      // Agenda só mostra quem ainda NÃO saiu (status hospedado)
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

// Inicialização (não alterada)
if (document.getElementById("tabela")) listarHospedes();
if (document.getElementById("agenda")) listarHospedesAgenda();
