const labelState = document.getElementById("province")
const nRecoveredState = document.getElementById("nRecuperados")
const nConfirmedSatate = document.getElementById("nConfirmados")
const nDeathState = document.getElementById("nMortes")

const nRecoveredCountry = document.getElementById("nRecuperadosCountry")
const nConfirmedCountry = document.getElementById("nConfirmadosCountry")
const nDeathCountry = document.getElementById("nMortesCountry")

var responseGeralCountry = []
var responseCountry = []
var responseState = []
var StateNames = []
var dataLocalization = []

function removerAcentos(newStringComAcento) {
    var string = newStringComAcento;
    var mapaAcentosHex = {
        a: /[\xE0-\xE6]/g,
        A: /[\xC0-\xC6]/g,
        e: /[\xE8-\xEB]/g,
        E: /[\xC8-\xCB]/g,
        i: /[\xEC-\xEF]/g,
        I: /[\xCC-\xCF]/g,
        o: /[\xF2-\xF6]/g,
        O: /[\xD2-\xD6]/g,
        u: /[\xF9-\xFC]/g,
        U: /[\xD9-\xDC]/g,
        c: /\xE7/g,
        C: /\xC7/g,
        n: /\xF1/g,
        N: /\xD1/g,
    };

    for (var letra in mapaAcentosHex) {
        var expressaoRegular = mapaAcentosHex[letra];
        string = string.replace(expressaoRegular, letra);
    }

    return string;
}


function localization() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            dataLocalization = await localizationState(position.coords.longitude, position.coords.latitude)
            searchCountry(false)
        }, function(error) {
            console.log(error)
        }, {
            enableHighAccuracy: true
        })
    } else {
        alert('Não foi possivel obter sua localização.')
    }
}

function localizationState(long, lat) {
    return axios.get(`http://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`)
}

localization()


//Todos os dados de estados do pais
function covidGet(parameter) {
    return axios.get(`https://api.covid19api.com/live/country/${parameter}/status/confirmed`)
}

//Dados do Pais em geral
function covidGetCountry(parameter) {
    return axios.get(`https://api.covid19api.com/total/dayone/country/${parameter}`)
}


function Dropdown(parameter, op) {
    var dropdown = document.getElementById("province-dropdown")
    if (op == true) {
        parameter.forEach(parameter => {
            var item = document.createElement('a')
            item.innerHTML = parameter.Province
            item.classList.add("dropdown-item")
            item.id = parameter.ID
            dropdown.appendChild(item)
            item.onclick = function() {
                (searchState(item.id))
            }
        })
    } else {
        dropdown.innerHTML = ''
    }
}

function LastData() {
    LastDataCountry(responseGeralCountry.data)
    LastDataStates(responseCountry.data)
}

function Clear() {
    Dropdown(responseState, false)
    responseGeralCountry = []
    responseCountry = []
    responseState = []
    StateNames = []
    responseState = []
}

async function searchCountry(op) {
    CountryInput = document.getElementById("countrySearch").value
    if (op == true) {
        Clear()
        responseCountry = await covidGet(CountryInput)
        responseGeralCountry = await covidGetCountry(CountryInput)
        LastData()
    } else {
        responseCountry = await covidGet(dataLocalization.data.address.country)
        responseGeralCountry = await covidGetCountry(dataLocalization.data.address.country)
        LastData()
        responseState.forEach(state => {
            var nameStateAux = removerAcentos(dataLocalization.data.address.state)
            if (nameStateAux == state.Province) {
                searchState(state.ID)
            }
        })
    }
    Dropdown(responseState, true)
    console.log(responseState)
    return responseCountry
}


function LastDataCountry(parameter) {
    var lastData = []
    lastData.push(parameter[parameter.length - 1])
    Counter(lastData[0], false)
}


function LastDataStates(data) {
    var allStates = []
    var dataAux = []
    data.forEach(data => {
        StateNames.push(data.Province)
    })
    var nomesEstadosFiltrados = StateNames.filter(
        function(estado, i) {
            return StateNames.indexOf(estado) === i;
        }
    );
    nomesEstadosFiltrados.forEach(estado => {
        data.forEach(data => {
            if (data.Province == estado)
                dataAux.push(data)
        })
        allStates.push(dataAux[dataAux.length - 1])
    })
    responseState = allStates
    return allStates;
}


function searchState(id) {
    var data = []
    var lastData
    response = responseCountry
    const provinces = response.data
    provinces.forEach(province => {
        if (province.ID == id) {
            data.push(province)
        }
    });
    lastData = data[data.length - 1]
    Counter(lastData, true)
    preencherGraficoPizza(responseState)
    preencherHistograma(responseState)

}


function Counter(parameter, op) {
    if (op == true) {
        labelState.innerHTML = parameter.Province
        nConfirmedSatate.innerHTML = parameter.Confirmed.toLocaleString()
        nRecoveredState.innerHTML = parameter.Recovered.toLocaleString()
        nDeathState.innerHTML = parameter.Deaths.toLocaleString()
    } else {
        nRecoveredCountry.innerHTML = parameter.Recovered.toLocaleString()
        nConfirmedCountry.innerHTML = parameter.Confirmed.toLocaleString()
        nDeathCountry.innerHTML = parameter.Deaths.toLocaleString()
    }
}


google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(preencherGraficoPizza);


function preencherGraficoPizza(todosEstados) {
    const dataArray = []
    dataArray.push(['Estados', 'Mortes'])
    todosEstados.forEach(estado => {
        dataArray.push([estado.Province, Number(estado.Deaths)])
    })
    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        title: 'Mortes nos estados',
        is3D: true,
        backgroundColor: 'transparent',
        slices: {

        }
    };
    var chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart.draw(data, options);
}


google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(preencherHistograma);

function preencherHistograma(todosEstados) {
    const dataArray = []
    dataArray.push(['Estados', 'Recuperados'])
    todosEstados.forEach(estado => {
        dataArray.push([estado.Province, Number(estado.Recovered)])
    })

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        title: 'Recuperados nos estados',
        legend: { position: 'none' },
        backgroundColor: 'transparent',
        colors: ['#4285F4'],

        chartArea: { width: 350 },
        hAxis: {
            ticks: []
        },
        bar: { gap: 0 },

        histogram: {
            bucketSize: 0.01,
            maxNumBuckets: 400,
            minValue: -1,
            maxValue: 1
        }
    };

    var chart = new google.visualization.Histogram(document.getElementById('chart_div'));
    chart.draw(data, options);
}