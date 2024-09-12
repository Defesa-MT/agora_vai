function addStationsToMap(map) {
    // Detecta se está rodando no GitHub Pages ou localmente
    const isGitHubPages = window.location.hostname === 'iz-brum.github.io';

    const dataUrl = isGitHubPages
        ? './data/stationsData.json'  // Se for GitHub Pages, usa o arquivo JSON estático
        : 'http://localhost:3000/stations';  // Se for local, usa o backend local

    // Faz o fetch dos dados
    fetch(dataUrl)
        .then(response => response.json())
        .then(stations => {
            // Cria um grupo de clusters para as estações
            const stationMarkers = L.markerClusterGroup({
                iconCreateFunction: function (cluster) {
                    let count = cluster.getChildCount();
                    let size = 'large';  // Default

                    if (count < 10) {
                        size = 'small';
                    } else if (count < 100) {
                        size = 'medium';
                    }

                    return new L.DivIcon({
                        html: `<div><span>${count}</span></div>`,
                        className: `station-cluster station-cluster-${size}`,
                        iconSize: new L.Point(30, 30)  // Aumenta o tamanho dos clusters
                    });
                }
            });

            // Para cada estação, crie um marcador e adicione ao grupo de clusters
            stations.forEach(station => {
                const marker = L.marker([station.lat, station.lng])
                    .bindPopup(`
                        <b>Estação: ${station.name}</b><br>
                        Código: ${station.codigoestacao} <br>
                        Tipo de Estação: ${station.tipoEstacao} <br>
                        Bacia: ${station.bacia}<br>
                        Município: ${station.municipio}<br>
                        <b>Carregando dados de chuva, nível e vazão...</b>
                    `);

                // Adiciona evento para carregar os dados hidrológicos ao abrir o popup
                marker.on('popupopen', async function () {
                    const hydroData = await fetchHydrologicalData(station.codigoestacao);
                    marker.setPopupContent(`
                        <b>Estação: ${station.name}</b><br>
                        Código: ${station.codigoestacao} <br>
                        Tipo de Estação: ${station.tipoEstacao} <br>
                        Bacia: ${station.bacia}<br>
                        Município: ${station.municipio}<br>
                        <b>Chuva:</b> ${hydroData.chuva} mm<br>
                        <b>Nível:</b> ${hydroData.nivel} m<br>
                        <b>Vazão:</b> ${hydroData.vazao} m³/s
                    `);
                });

                stationMarkers.addLayer(marker);  // Adiciona o marcador ao cluster
            });

            // Adiciona o grupo de clusters ao mapa
            map.addLayer(stationMarkers);

            // Atualiza o controle de camadas para incluir a camada das estações
            overlaysTree.push({ label: 'Estações', layer: stationMarkers });

            // Atualiza o controle de camadas no mapa
            lay.remove(); // Remove o controle anterior
            lay = L.control.layers.tree(null, overlaysTree, {
                collapsed: true,
            }).addTo(map); // Adiciona novamente com a nova camada

        })
        .catch(error => {
            console.error('Erro ao carregar estações:', error);
        });
}

// Função para carregar dados hidrológicos da estação através do servidor
async function fetchHydrologicalData(codigoEstacao) {
    // Detecta se está rodando no GitHub Pages ou localmente
    const isGitHubPages = window.location.hostname === 'iz-brum.github.io';

    const url = isGitHubPages
        ? `./data/hydrologicalData.json?codigoEstacao=${codigoEstacao}`  // Caminho para o arquivo estático no GitHub Pages
        : `http://localhost:3000/hydrological-data?codigoEstacao=${codigoEstacao}`;  // Backend local para desenvolvimento

    try {
        const response = await fetch(url);
        const data = await response.json();

        return {
            chuva: data.chuva || 'N/A',
            nivel: data.nivel || 'N/A',
            vazao: data.vazao || 'N/A',
        };
    } catch (error) {
        console.error('Erro ao carregar dados hidrológicos:', error);
        return {
            chuva: 'Erro',
            nivel: 'Erro',
            vazao: 'Erro',
        };
    }
}

// Espera que o mapa seja inicializado no index.html
document.addEventListener('DOMContentLoaded', function () {
    if (typeof map !== 'undefined') {
        addStationsToMap(map);  // Chama a função para adicionar as estações ao mapa se o mapa existir
    } else {
        console.error('O mapa não foi inicializado corretamente.');
    }
});

// Função para adicionar dinamicamente o arquivo CSS
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// Chama a função para adicionar o CSS
loadCSS('css/cluster-custom.css');
