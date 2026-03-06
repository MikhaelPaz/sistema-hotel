const API = window.location.origin;


// ================== CADASTRAR (ADICIONE ESTE BLOCO) ==================
async function cadastrar() {
  const nome = document.getElementById("nome").value;
  const quarto = document.getElementById("quarto").value;
  const valor_diaria = document.getElementById("valor_diaria").value;

  // Validação simples para não enviar campos vazios
  if (!nome || !quarto || !valor_diaria) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch(`${API}/cadastrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        nome: nome, 
        quarto: quarto, 
        valor_diaria: valor_diaria 
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      // Limpa os campos após cadastrar
      document.getElementById("nome").value = "";
      document.getElementById("quarto").value = "";
      document.getElementById("valor_diaria").value = "";
      
      // Atualiza a tabela na mesma página
      listarHospedes(); 
    } else {
      alert("Erro ao cadastrar: " + data.message);
    }
  } catch (error) {
    console.error("Erro na requisição de cadastro:", error);
    alert("Erro ao conectar com o servidor.");
  }
}


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

      if (document.getElementById("ativos")) atualizarContadorAtivos();
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

// ================== ATUALIZAR CONTADOR DE ATIVOS ==================
async function atualizarContadorAtivos() {
  const elementoAtivos = document.getElementById("ativos");
  if (!elementoAtivos) return; // Só executa se estiver na index.html

  try {
    const response = await fetch(`${API}/hospedes`);
    const hospedes = await response.json();

    // Filtra apenas quem está com status 'hospedado'
    const ativos = hospedes.filter(h => h.status.toLowerCase() === 'hospedado');

    // Atualiza o número na tela
    elementoAtivos.innerText = ativos.length;

  } catch (error) {
    console.error("Erro ao atualizar contador:", error);
    elementoAtivos.innerText = "!";
  }
}

// ================== FATURAMENTO ==================
async function atualizarFaturamento() {
    const elementoFaturamento = document.getElementById("faturamento");
    if (!elementoFaturamento) return;

    try {
        const response = await fetch(`${API}/faturamento`);
        const data = await response.json();
        const total = parseFloat(data.total) || 0;
        elementoFaturamento.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;
    } catch (error) {
        console.error("Erro ao buscar faturamento:", error);
        elementoFaturamento.innerText = "Erro";
    }
}

async function limparFaturamento() {
    if (!confirm("Tem certeza que deseja limpar o faturamento do mês?")) return;

    try {
        const response = await fetch(`${API}/faturamento`, { method: "DELETE" });
        const data = await response.json();
        alert(data.message);
        atualizarFaturamento();
    } catch (error) {
        console.error("Erro ao limpar faturamento:", error);
        alert("Erro ao conectar com o servidor.");
    }
}


// Chame a função no final do script para carregar ao abrir a página
if (document.getElementById("ativos")) {
  atualizarContadorAtivos();
}


// Inicialização
if (document.getElementById("tabela")) listarHospedes();
if (document.getElementById("agenda")) listarHospedesAgenda();
if (document.getElementById("faturamento")) atualizarFaturamento();
