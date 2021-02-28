const nomeEstado = document.getElementById("province")
const nRecuperados = document.getElementById("nRecuperados")
const nConfirmados = document.getElementById("nConfirmados")
const nMortes = document.getElementById("nMortes")
var response
var nomesEstados = []

//Consulta API
function covidGet() {
    return axios.get('https://api.covid19api.com/live/country/brazil/status/confirmed')
}

async function covidGetBrazil() {
    console.log(await axios.get('https://api.covid19api.com/total/dayone/country/ivory-coast'))
}

covidGetBrazil()

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
    console.log(todosEstados)
    return todosEstados;
}

//Retorna o dado mais recente do estado no input
async function searchEstado() {
    var estadoInput = document.getElementById("provinceSearch").value;
    var dataEstado = []
    var todosEstados
    var dadoMaisRecente
    response = await covidGet()
    const provinces = response.data
    provinces.forEach(province => {
        if (province.Province == estadoInput) {
            dataEstado.push(province)
        }
    });
    console.log(response)
    dadoMaisRecente = dataEstado[dataEstado.length - 1]
    preencherContadores(dadoMaisRecente)
    todosEstados = UltimosDadosEstados(response.data)
    preencherGraficoPizza(todosEstados)
    preencherHistograma(todosEstados)

}

function preencherContadores(parametro) {
    console.log(parametro)
    nomeEstado.innerHTML = parametro.Province
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

    var i = 0
    var estadoInput = document.getElementById("provinceSearch").value
    todosEstados.forEach(estado => {
        if (estado.Province == estadoInput) {
            i = { offset = 0.4 }
        }
        i++
    })

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
        title: 'Recuperados nos estado',
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