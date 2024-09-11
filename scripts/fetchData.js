import fetch from 'node-fetch';  // Suporte para fetch no Node.js
import fs from 'fs';  // Módulo de sistema de arquivos

const identificador = process.env.API_IDENTIFIER;
const senha = process.env.API_PASSWORD;

async function authenticate() {
    const response = await fetch('https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1', {
        method: 'GET',
        headers: {
            'Identificador': identificador,
            'Senha': senha
        }
    });

    const data = await response.json();
    console.log('Autenticação bem-sucedida:', data);

    // Salva a resposta da API em um arquivo JSON estático
    fs.writeFileSync('data/apiData.json', JSON.stringify(data, null, 2));

    console.log('Dados da API salvos em data/apiData.json');
}

authenticate();
