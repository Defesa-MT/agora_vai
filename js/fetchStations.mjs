import { authenticate } from './auth.mjs';  // Importa a função de autenticação
import axios from 'axios';

// Função para buscar estações do Mato Grosso (UF: "MT")
export async function fetchStationsMatoGrosso() {
    const url = 'https://www.ana.gov.br/hidrowebservice/EstacoesTelemetricas/HidroInventarioEstacoes/v1';

    try {
        // Chama a função authenticate e obtém o token correto
        const authResponse = await authenticate();

        // Obtém o token de autenticação correto (tokenautenticacao)
        const token = authResponse.items.tokenautenticacao;

        // Faz a requisição para obter as estações, filtrando por UF "MT"
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,  // Usa o tokenautenticacao
                'Accept': 'application/json'
            },
            params: {
                'Unidade Federativa': 'MT'  // Filtro para o estado do Mato Grosso
            }
        });

        // Mapeia as estações retornadas para exibir todas as informações necessárias
        const stationsData = response.data.items.map(station => ({
            name: station.Estacao_Nome,                  // Nome da estação
            codigoestacao: station.codigoestacao,                  // Código da estação
            lat: parseFloat(station.Latitude),           // Latitude
            lng: parseFloat(station.Longitude),          // Longitude
            altitude: station.Altitude || 'N/A',         // Altitude
            bacia: station.Bacia_Nome || 'N/A',          // Nome da Bacia
            municipio: station.Municipio_Nome || 'N/A',  // Nome do Município
            ultimaAtualizacao: station.Data_Ultima_Atualizacao || 'N/A', // Última atualização
            tipoEstacao: station.Tipo_Estacao || 'N/A'   // Tipo de estação
        }));

        // Exibe as estações no console
        // console.log('Estações no Mato Grosso:', stationsData);

        // Retorna os dados para serem usados no frontend
        return stationsData;

    } catch (error) {
        // Trata e exibe erros de requisição
        console.error('Erro ao buscar estações:', error);
    }
}
