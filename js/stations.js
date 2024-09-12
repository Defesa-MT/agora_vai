// Função para carregar dados hidrológicos da estação através do servidor
async function fetchHydrologicalData(codigoEstacao, isNode = false) {
    let url;

    if (isNode) {
        url = `http://localhost:3000/hydrological-data?codigoEstacao=${codigoEstacao}`;
    } else {
        const isGitHubPages = window.location.hostname === 'iz-brum.github.io';
        url = isGitHubPages
            ? `./data/hydrologicalData.json?codigoEstacao=${codigoEstacao}`
            : `http://localhost:3000/hydrological-data?codigoEstacao=${codigoEstacao}`;
    }

    try {
        console.log(`Fazendo requisição para: ${url}`);
        const response = await fetch(url);
        console.log(`Status da resposta: ${response.status} - ${response.statusText}`);

        if (!response.ok) {
            throw new Error(`Falha na requisição: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Dados recebidos para a estação ${codigoEstacao}:`, data);

        return {
            chuva: data.chuva || 'N/A',
            nivel: data.nivel || 'N/A',
            vazao: data.vazao || 'N/A',
        };
    } catch (error) {
        console.error(`Erro ao carregar dados hidrológicos para a estação ${codigoEstacao}:`, error);
        return {
            chuva: 'Erro',
            nivel: 'Erro',
            vazao: 'Erro',
        };
    }
}

// Verifique se está em um ambiente de navegador antes de executar qualquer código relacionado ao DOM
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Espera que o mapa seja inicializado no index.html (apenas em navegador)
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof map !== 'undefined') {
            addStationsToMap(map);  // Chama a função para adicionar as estações ao mapa se o mapa existir
        } else {
            console.error('O mapa não foi inicializado corretamente.');
        }
    });

    // Função para adicionar dinamicamente o arquivo CSS (apenas em navegador)
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    // Chama a função para adicionar o CSS
    loadCSS('css/cluster-custom.css');
}

// Função que adiciona estações ao mapa e configura popups com os dados
function addStationsToMap(map) {
    const isGitHubPages = window.location.hostname === 'iz-brum.github.io';
    const dataUrl = isGitHubPages ? './data/stationsData.json' : 'http://localhost:3000/stations';

    fetch(dataUrl)
        .then(response => response.json())
        .then(stations => {
            const stationMarkers = L.markerClusterGroup({
                iconCreateFunction: function (cluster) {
                    let count = cluster.getChildCount();
                    let size = 'large';

                    if (count < 10) {
                        size = 'small';
                    } else if (count < 100) {
                        size = 'medium';
                    }

                    return new L.DivIcon({
                        html: `<div><span>${count}</span></div>`,
                        className: `station-cluster station-cluster-${size}`,
                        iconSize: new L.Point(30, 30),
                    });
                },
            });

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

                stationMarkers.addLayer(marker);
            });

            map.addLayer(stationMarkers);

            overlaysTree.push({ label: 'Estações', layer: stationMarkers });

            lay.remove(); 
            lay = L.control.layers.tree(null, overlaysTree, { collapsed: true }).addTo(map);
        })
        .catch(error => {
            console.error('Erro ao carregar estações:', error);
        });
}
