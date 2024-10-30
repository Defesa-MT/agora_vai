// Função para limpar os layers existentes antes de adicionar novos
function clearLayers() {
    grayStations.clearLayers();
    yellowStations.clearLayers();
    orangeStations.clearLayers();
    redStations.clearLayers();
}

// Função para buscar o JSON e adicionar as estações no mapa
function addStationsToMap() {
    const stationsJsonUrl = 'https://agora-meze7113w-iz-brums-projects.vercel.app/api/stations';

    axios.get(stationsJsonUrl)
        .then(response => {
            const stationsData = response.data;
            console.log('Dados recebidos:', stationsData);  // Inspecione os dados no console

            // Limpar os layers antigos
            clearLayers();

            if (Array.isArray(stationsData)) {
                stationsData.forEach(station => {
                    // Converte a latitude e longitude para números, substituindo vírgula por ponto
                    const latitude = parseFloat(station.latitude.toString().replace(',', '.'));
                    const longitude = parseFloat(station.longitude.toString().replace(',', '.'));

                    // Verifica se as coordenadas são válidas
                    if (!isNaN(latitude) && !isNaN(longitude)) {
                        const markerColor = getColorBasedOnRainfall(station.chuva24h);
                        const marker = L.circleMarker([latitude, longitude], {
                            radius: 8,
                            fillColor: markerColor,
                            color: '#000',
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        });

                        marker.bindPopup(`
                        <b>${station.nome}</b><br>
                        Chuva 24h: <strong>${station.chuva24h === 'n/a' ? 'N/A' : station.chuva24h}</strong><br>
                        Nível: <strong>${station.nivel}</strong><br>
                        Vazão: <strong>${station.vazao}</strong><br>
                        Atualizado em: <strong>${station.dataAtualizacao}</strong><br>
                        Cidade/UF: <strong>${station.cidadeUf}</strong>
                    `);

                        // Adicionar o marcador à camada correspondente de acordo com a chuva
                        const chuva = station.chuva24h === 'n/a' ? null : parseFloat(station.chuva24h.replace(',', '.'));
                        if (chuva === null) {
                            grayStations.addLayer(marker);  // Para chuva 'n/a' (cinza)
                        } else if (chuva > 100) {
                            redStations.addLayer(marker);  // Para chuva > 100mm (vermelho)
                        } else if (chuva >= 50) {
                            orangeStations.addLayer(marker);  // Para chuva entre 50mm e 100mm (alaranjado)
                        } else {
                            yellowStations.addLayer(marker);  // Para chuva < 50mm (amarelo)
                        }
                    } else {
                        console.error('Coordenadas inválidas:', station.latitude, station.longitude);
                    }
                });
            } else {
                console.error('Os dados recebidos não são um array:', stationsData);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os dados das estações:', error);
        });
}

// Função para determinar a cor do marcador com base na chuva
function getColorBasedOnRainfall(chuva24h) {
    if (chuva24h === 'n/a') return 'gray';  // Cor cinza para chuva 'n/a'
    const chuva = parseFloat(chuva24h.replace(',', '.'));
    if (chuva > 100) return 'red';
    if (chuva >= 50) return 'orange';
    return 'yellow';
}

// Chamar a função inicialmente para adicionar as estações no mapa
addStationsToMap();

// Atualizar os marcadores a cada 30 minutos (ou outro intervalo de tempo que preferir)
setInterval(addStationsToMap, 31 * 60 * 1000);  // 31 minutos em milissegundos
