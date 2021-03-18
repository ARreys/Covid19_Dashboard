const labelEstado = document.getElementById("province")
const nRecuperados = document.getElementById("nRecuperados")
const nConfirmados = document.getElementById("nConfirmados")
const nMortes = document.getElementById("nMortes")
var response
var responsePaises = []
var responseEstados = []
var nomesEstados = []


//Consulta API
function covidGet(parametro) {
    return axios.get(`https://api.covid19api.com/live/country/${parametro}/status/confirmed`)
}

// //Dados do Pais em geral
// async function covidGetBrazil() {
//     console.log(await axios.get('https://api.covid19api.com/countries'))
// }
// covidGetBrazil()

//Preenche o dropdown de todos os estado
function preencherDropdown(data) {
    var dropdown = document.getElementById("province-dropdown")
    dropdown.innerText = ""
    data.forEach(data => {
        var item = document.createElement('a')
        item.innerHTML = data.Province
        item.classList.add("dropdown-item")
        item.id = data.ID
        dropdown.appendChild(item)
        item.onclick = function() {
            (searchEstado(item.id))
        }
    })
}

//Retorna todos os dados de todos os estado do pais
async function searchPais() {
    nomesEstados = []
    response = []
    responseEstados = []
    responsePaises = []
    paisInput = document.getElementById("countrySearch").value
    responsePaises = await covidGet(paisInput)
    UltimosDadosEstados(responsePaises.data)
    preencherDropdown(responseEstados)
    return responsePaises
}

//Retorna o dado mais recente de todos os estados
function UltimosDadosEstados(data) {
    var todosEstados = []
    var dataAux = []
    data.forEach(data => {
        nomesEstados.push(data.Province)
    })
    var nomesEstadosFiltrados = nomesEstados.filter(
        function(estado, i) {
            return nomesEstados.indexOf(estado) === i;
        }
    );
    nomesEstadosFiltrados.forEach(estado => {
        data.forEach(data => {
            if (data.Province == estado)
                dataAux.push(data)
        })
        todosEstados.push(dataAux[dataAux.length - 1])
    })
    responseEstados = todosEstados
    return todosEstados;
}

//Retorna o dado mais recente do estado no input
async function searchEstado(id) {
    var dataEstado = []
    var dadoMaisRecente
    response = responsePaises
    const provinces = response.data
    provinces.forEach(province => {
        if (province.ID == id) {
            dataEstado.push(province)
        }
    });
    dadoMaisRecente = dataEstado[dataEstado.length - 1]
    preencherContadores(dadoMaisRecente)
    preencherGraficoPizza(responseEstados)
    preencherHistograma(responseEstados)

}

function preencherContadores(parametro) {
    labelEstado.innerHTML = parametro.Province
    nConfirmados.innerHTML = parametro.Confirmed.toLocaleString()
    nRecuperados.innerHTML = parametro.Recovered.toLocaleString()
    nMortes.innerHTML = parametro.Deaths.toLocaleString()
}


google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(preencherGraficoPizza);


function findIndex(todosEstados) {
    var estadoOffset
    var i = 0
    var estadoInput = document.getElementById("provinceSearch").value
    todosEstados.forEach(estado => {
        if (estado.Province == estadoInput) {
            estadoOffset = i
        }
        i++
    })
    return estadoOffset
}


function preencherGraficoPizza(todosEstados) {
    const dataArray = []
    dataArray.push(['Estados', 'Mortes'])
    todosEstados.forEach(estado => {
        dataArray.push([estado.Province, Number(estado.Deaths)])
    })
    var data = google.visualization.arrayToDataTable(dataArray);

    // var i = 0
    // var estadoInput = document.getElementById("provinceSearch").value
    // todosEstados.forEach(estado => {
    //     if (estado.Province == estadoInput) {
    //         i = { offset = 0.4 }
    //     }
    //     i++
    // })

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
            ticks: [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]
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