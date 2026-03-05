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
  // Confirmação para evitar cliques acidentais
  if (!confirm("Deseja realmente realizar o check-out?")) return;

  try {
    const response = await fetch(`${API}/checkout/${id}`, {
      method: "POST" // Ou "POST", dependendo de como você configurou seu servidor
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message || "Check-out realizado com sucesso!");
      
      // Recarrega a lista para o botão sumir e aparecer "Finalizado"
      listarHospedes(); 
    } else {
      alert("Erro ao realizar check-out no servidor.");
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
