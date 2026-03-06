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

// CADASTRAR (Ajustado)
app.post("/cadastrar", (req, res) => {
    const { nome, quarto, valor_diaria } = req.body;

    // Verificação de segurança: impede inserir valores nulos no MySQL
    if (!nome || !quarto || !valor_diaria) {
        return res.status(400).json({ message: "Preencha todos os campos corretamente." });
    }

    db.query(
        "INSERT INTO hospedagens (nome, quarto, valor_diaria, status) VALUES (?, ?, ?, 'hospedado')",
        [nome, quarto, valor_diaria],
        (err) => {
            if (err) {
                console.error("Erro no MySQL:", err);
                return res.status(500).send(err);
            }
            res.json({ message: "Hóspede cadastrado com sucesso!" });
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

// CHECKOUT — agora salva no histórico de faturamento
app.post('/checkout/:id', (req, res) => {
    const id = req.params.id;
    const { quantidade_diarias } = req.body;

    db.query("SELECT * FROM hospedagens WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Erro ao buscar hóspede" });
        if (results.length === 0) return res.status(404).json({ message: "Hóspede não encontrado" });

        const { nome, quarto, valor_diaria } = results[0];
        const total = valor_diaria * quantidade_diarias;

        // Salva no histórico ANTES de deletar
        db.query(
            "INSERT INTO faturamento (nome, quarto, total) VALUES (?, ?, ?)",
            [nome, quarto, total],
            (errInsert) => {
                if (errInsert) return res.status(500).json({ message: "Erro ao salvar faturamento" });

                db.query("DELETE FROM hospedagens WHERE id = ?", [id], (errDelete) => {
                    if (errDelete) return res.status(500).json({ message: "Erro ao deletar" });

                    res.json({ total, message: "Checkout realizado e faturamento salvo." });
                });
            }
        );
    });
});

// BUSCAR FATURAMENTO MENSAL
app.get("/faturamento", (req, res) => {
    db.query(
        "SELECT SUM(total) as total FROM faturamento WHERE MONTH(data_checkout) = MONTH(NOW()) AND YEAR(data_checkout) = YEAR(NOW())",
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ total: result[0].total || 0 });
        }
    );
});

// LIMPAR FATURAMENTO MENSAL
app.delete("/faturamento", (req, res) => {
    db.query(
        "DELETE FROM faturamento WHERE MONTH(data_checkout) = MONTH(NOW()) AND YEAR(data_checkout) = YEAR(NOW())",
        (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: "Faturamento limpo com sucesso!" });
        }
    );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));
