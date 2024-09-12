import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authenticate } from './auth.mjs';  // Importando o método de autenticação
import dotenv from 'dotenv';
import axios from 'axios';  // Para fazer as requisições HTTP
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

// Novo endpoint para buscar dados hidrológicos
app.get('/hydrological-data', async (req, res) => {
    const { codigoEstacao } = req.query;
    const url = 'https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroinfoanaSerieTelemetricaAdotada/v1';
    
    try {
        const authResponse = await authenticate();
        const token = authResponse.items.tokenautenticacao;

        // Faz a requisição para buscar os dados hidrológicos
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            params: {
                'Código da Estação': codigoEstacao,
                'Tipo Filtro Data': 'DATA_LEITURA',
                'Data de Busca (yyyy-MM-dd)': new Date().toISOString().split('T')[0],
                'Range Intervalo de busca': 'HORA_24'
            }
        });

        const items = response.data.items;
        console.log(items);

        if (items.length > 0) {
            // Acessa o último item da lista, que representa o dado mais recente
            const latestData = items[items.length - 1];

            res.json({
                chuva: latestData.Chuva_Adotada || 'N/A',
                nivel: latestData.Cota_Adotada || 'N/A',
                vazao: latestData.Vazao_Adotada || 'N/A',
            });
        } else {
            res.json({
                chuva: 'N/A',
                nivel: 'N/A',
                vazao: 'N/A',
            });
        }

    } catch (error) {
        console.error('Erro ao carregar dados hidrológicos:', error);
        res.status(500).json({
            chuva: 'Erro',
            nivel: 'Erro',
            vazao: 'Erro',
        });
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
