const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas as rotas
app.use(cors());

// Servir arquivos estáticos da pasta raiz (onde está o index.html)
app.use(express.static(path.join(__dirname, '../')));  // Aqui ele vai servir a pasta raiz

// Rota para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));  // Certifique-se que o index.html está na raiz
});

// Variável para armazenar os dados em cache
let cachedStationsData = null;

// Função para buscar os dados do Google Drive
const fetchStationsData = async () => {
    try {
        const stationsJsonUrl = 'https://drive.google.com/uc?export=download&id=1y2XW6rMchYNcfTNgeI73LJjVcXfKJ6LX';
        const response = await axios.get(stationsJsonUrl);
        console.log('Dados atualizados do Google Drive:', response.data);
        cachedStationsData = response.data;  // Atualiza o cache com os novos dados
    } catch (error) {
        console.error('Erro ao buscar dados das estações:', error);
    }
};

// Rota para fornecer os dados em cache
app.get('/api/stations', (req, res) => {
    if (cachedStationsData) {
        res.json(cachedStationsData);  // Envia os dados em cache
    } else {
        res.status(500).json({ message: 'Dados não disponíveis no momento.' });
    }
});

// Agendar a atualização dos dados a cada 30 minutos
setInterval(fetchStationsData, 10 * 60 * 1000);  // 10 minutos em milissegundos

// Inicializa a busca de dados ao iniciar o servidor
fetchStationsData();

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
