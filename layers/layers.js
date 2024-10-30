var wms_layers = [];


        var lyr_ESRIGraydark_0 = new ol.layer.Tile({
            'title': 'ESRI Gray (dark)',
            //'type': 'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
    attributions: ' ',
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            })
        });

        var lyr_GoogleTerrain_1 = new ol.layer.Tile({
            'title': 'Google Terrain',
            //'type': 'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
    attributions: ' &middot; <a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>',
                url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
            })
        });

        var lyr_GoogleHybrid_2 = new ol.layer.Tile({
            'title': 'Google Hybrid',
            //'type': 'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
    attributions: ' &middot; <a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>',
                url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            })
        });
var format_MT_UF_2022_3 = new ol.format.GeoJSON();
var features_MT_UF_2022_3 = format_MT_UF_2022_3.readFeatures(json_MT_UF_2022_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_MT_UF_2022_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_MT_UF_2022_3.addFeatures(features_MT_UF_2022_3);
var lyr_MT_UF_2022_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_MT_UF_2022_3, 
                style: style_MT_UF_2022_3,
                popuplayertitle: "MT_UF_2022",
                interactive: true,
                title: '<img src="styles/legend/MT_UF_2022_3.png" /> MT_UF_2022'
            });

lyr_ESRIGraydark_0.setVisible(true);lyr_GoogleTerrain_1.setVisible(true);lyr_GoogleHybrid_2.setVisible(true);lyr_MT_UF_2022_3.setVisible(true);
var layersList = [lyr_ESRIGraydark_0,lyr_GoogleTerrain_1,lyr_GoogleHybrid_2,lyr_MT_UF_2022_3];
lyr_MT_UF_2022_3.set('fieldAliases', {'CD_UF': 'CD_UF', 'NM_UF': 'NM_UF', 'SIGLA_UF': 'SIGLA_UF', 'NM_REGIAO': 'NM_REGIAO', 'AREA_KM2': 'AREA_KM2', });
lyr_MT_UF_2022_3.set('fieldImages', {'CD_UF': 'TextEdit', 'NM_UF': 'TextEdit', 'SIGLA_UF': 'TextEdit', 'NM_REGIAO': 'TextEdit', 'AREA_KM2': 'TextEdit', });
lyr_MT_UF_2022_3.set('fieldLabels', {'CD_UF': 'inline label - always visible', 'NM_UF': 'inline label - always visible', 'SIGLA_UF': 'inline label - always visible', 'NM_REGIAO': 'inline label - always visible', 'AREA_KM2': 'inline label - always visible', });
lyr_MT_UF_2022_3.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});