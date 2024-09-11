// auth.mjs (somente no backend - servidor)
import 'dotenv/config';  // Carrega as variáveis de ambiente
import fetch from 'node-fetch';  // Usa node-fetch para fazer requisições

// Obtém as variáveis de ambiente do .env
const identificador = process.env.API_IDENTIFIER;
const senha = process.env.API_PASSWORD;

// Função para autenticar na API da ANA e obter o token
export async function authenticate() {
    const response = await fetch('https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/OAUth/v1', {
        method: 'GET',
        headers: {
            'Identificador': identificador,
            'Senha': senha
        }
    });

    const data = await response.json();  // Converte a resposta em JSON
    console.log('Autenticação bem-sucedida:', data);
    return data;
}

// ok