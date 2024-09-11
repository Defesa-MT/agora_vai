import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticate } from './auth.mjs';  // Importando o método de autenticação
import dotenv from 'dotenv';
// import axios from 'axios';  // Para fazer as requisições HTTP
import { fetchStationsMatoGrosso } from './fetchStations.mjs'; // Importa a função para obter as estações


dotenv.config();  // Carrega variáveis de ambiente do .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Ativa CORS para permitir requests de outras origens
app.use(cors());

// Endpoint para servir o token da API da ANA
app.get('/token', async (req, res) => {
    try {
        const token = await authenticate();  // Chama a função de autenticação para obter o token
        if (token) {
            res.json({ token: token.items.tokenautenticacao });  // Retorna o token autenticado
        } else {
            res.status(500).json({ error: 'Failed to fetch token from ANA' });
        }
    } catch (error) {
        console.error('Error fetching token from ANA:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Novo endpoint para retornar estações de Mato Grosso
app.get('/stations', async (req, res) => {
    try {
        const stationsData = await fetchStationsMatoGrosso();  // Chama a função importada
        res.json(stationsData);  // Retorna os dados das estações para o frontend
    } catch (error) {
        console.error('Erro ao buscar estações:', error);
        res.status(500).json({ error: 'Erro ao buscar estações' });
    }
});

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../')));

// Serve o arquivo HTML na rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));  // Serve o arquivo index.html
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
