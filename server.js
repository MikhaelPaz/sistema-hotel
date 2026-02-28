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
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
            res.send("Hóspede cadastrado");
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
app.post("/checkout/:id", (req, res) => {
    const id = req.params.id;
    const { quantidade_diarias } = req.body;

    db.query("SELECT * FROM hospedagens WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).send("Hóspede não encontrado");

        const hospede = result[0];
        const total = hospede.valor_diaria * quantidade_diarias;

        db.query(
            `UPDATE hospedagens 
             SET quantidade_diarias = ?, 
                 total_pago = ?, 
                 status = 'finalizado',
                 data_checkout = NOW()
             WHERE id = ?`,
            [quantidade_diarias, total, id],
            (err) => {
                if (err) return res.status(500).send(err);
                res.json({ total });
            }
        );
    });
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
