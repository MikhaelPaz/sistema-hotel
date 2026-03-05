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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, quarto, valor_diaria })
    });

    const data = await response.json();
    alert(data.message);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar!");
  }
}

// ================== LISTAR NA TABELA (CADASTRO.HTML) ==================
async function listarHospedes() {
  const tabela = document.getElementById("tabela");
  if (!tabela) return; // Sai da função se não estiver na página de cadastro

  try {
    const response = await fetch(`${API}/hospedes`);
    const hospedes = await response.json();
    tabela.innerHTML = "";

    hospedes.forEach(hospede => {
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
    // 1. Faz o Checkout no servidor (para calcular o valor e mudar status se necessário)
    const response = await fetch(`${API}/checkout/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade_diarias: parseInt(quantidade_diarias) })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Check-out realizado!\nTotal pago: R$ ${data.total.toFixed(2)}`);

      // 2. AGORA APAGA DO BANCO DE DADOS
      // Dentro da função checkout, na parte do DELETE:
      try {
          const deleteResponse = await fetch(`${API}/hospedes/${id}`, {
              method: "DELETE"
            });
          
          if (!deleteResponse.ok) {
              const errorData = await deleteResponse.json();
              throw new Error(errorData.message || "Erro ao deletar do banco");
          }

    // Só atualiza a tela se o servidor confirmar a exclusão
    if (document.getElementById("tabela")) listarHospedes();
    if (document.getElementById("agenda")) listarHospedesAgenda();

} catch (err) {
    console.error("Erro ao deletar:", err);
    alert("O checkout foi feito, mas não conseguimos apagar o registro: " + err.message);
}
      

      if (deleteResponse.ok) {
        // 3. Atualiza a interface (Agenda ou Tabela) conforme a página atual
        if (document.getElementById("tabela")) listarHospedes();
        if (document.getElementById("agenda")) listarHospedesAgenda();
      }
    } else {
      alert("Erro ao processar checkout: " + (data.message || data));
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
      // Opcional: só mostra na agenda quem ainda está "hospedado"
      if (hospede.status.toLowerCase() === 'hospedado') {
        agenda.innerHTML += `
          <li>
            <strong>${hospede.nome}</strong> - Quarto: ${hospede.quarto}
          </li>`;
      }
    });
  } catch (error) {
    console.error("Erro ao buscar hóspedes para agenda:", error);
  }
}

// Inicialização automática conforme a página
if (document.getElementById("tabela")) listarHospedes();
if (document.getElementById("agenda")) listarHospedesAgenda();
