require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQL_DATABASE
});



db.connect(err => {
    if (err) {
        console.error("Erro ao conectar:", err);
    } else {
        console.log("Conectado ao MySQL");
    }
});

// CADASTRAR
app.post("/cadastrar", (req, res) => {
    const { nome, quarto, valor_diaria } = req.body;

    db.query(
        "INSERT INTO hospedagens (nome, quarto, valor_diaria) VALUES (?, ?, ?)",
        [nome, quarto, valor_diaria],
        (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: "Hóspede cadastrado" });
        }
    );
});

// LISTAR
app.get("/hospedes", (req, res) => {
    db.query("SELECT * FROM hospedagens", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// CHECKOUT
app.post('/checkout/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { quantidade_diarias } = req.body;

        // 1. Busca o hóspede para calcular o valor antes de apagar
        const hospede = await Hospede.findById(id); 

        if (!hospede) {
            return res.status(404).json({ message: "Hóspede não encontrado" });
        }

        const total = hospede.valor_diaria * quantidade_diarias;

        // 2. DELETA o hóspede do banco de dados permanentemente
        await Hospede.findByIdAndDelete(id); 

        // 3. Retorna o sucesso e o valor
        res.json({ 
            total: total, 
            message: "Checkout finalizado e hóspede removido do sistema." 
        });

    } catch (error) {
        console.error("Erro no Checkout:", error);
        res.status(500).json({ message: "Erro interno ao processar checkout" });
    }
});



// FATURAMENTO MENSAL
app.get("/faturamento", (req, res) => {
    db.query(
        `SELECT SUM(total_pago) as total 
         FROM hospedagens 
         WHERE MONTH(data_checkout) = MONTH(CURRENT_DATE())
         AND YEAR(data_checkout) = YEAR(CURRENT_DATE())`,
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ total: result[0].total || 0 });
        }
    );
});

// LIMPAR FATURAMENTO MENSAL
app.post("/limpar-faturamento", (req, res) => {

    const sql = `
        UPDATE hospedagens
        SET total_pago = 0
        WHERE MONTH(data_checkout) = MONTH(CURRENT_DATE())
        AND YEAR(data_checkout) = YEAR(CURRENT_DATE())
    `;

    db.query(sql, (err) => {
        if (err) return res.status(500).send(err);
        res.send("Faturamento mensal zerado");
    });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando");
});
