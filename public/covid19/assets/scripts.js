/// autenticacion
async function getToken(email, password) {
  try {
    const response1 = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response1.status) return;

    const { token } = await response1.json();

    return token;
  } catch (error) {
    console.log('error');
  }
}

// función para llamar Casos Confirmados de Chile

async function confirmadosChile() {
  const token = await localStorage.getItem("token")
  const datos = await fetch('http://localhost:3000/api/confirmed', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const datos2 = await datos.json()
  const confirmadosChile = datos2.data
  const confirmadosChile10 = []
  for (let i = 0; i < confirmadosChile.length; i+=20) {
    confirmadosChile10.push(confirmadosChile[i])
  }
  return confirmadosChile10
}

//función para llamar Casos de Muertos de Chile
async function muertosChile() {
  const token = await localStorage.getItem("token")
  const datos = await fetch('http://localhost:3000/api/deaths', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const datos2 = await datos.json()
  const muertosChile = datos2.data
  const muertosChile10 = []
  for (let i = 0; i < muertosChile.length; i+=20 ) {
    muertosChile10.push(muertosChile[i])
  }
  return muertosChile10
}

//funcion para grafico situación Chile

async function graficoChile() {

  const confirmados = await confirmadosChile();
  const muertos = await muertosChile();

  const dataConfirmados = []
  const dataMuertos = []

  for (confirmado of confirmados) {
    dataConfirmados.push(
      {x: new Date(confirmado.date), y: confirmado.total}
    )
  }
  for (muerto of muertos) {
    dataMuertos.push(
      {x: new Date(muerto.date), y: muerto.total}
    )
  }


  var chart = new CanvasJS.Chart("chartChile", {
    animationEnabled: true,
    theme: "light2",
    title:{
      text: "Situación Chile"
    },
    axisX:{
      valueFormatString: "DD/MMM/YYYY",
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      }
    },
    axisY: {
      includeZero: true,
      crosshair: {
        enabled: true
      }
    },
    toolTip:{
      shared:true
    },  
    legend:{
      cursor:"pointer",
      verticalAlign: "top",
      horizontalAlign: "center",
      dockInsidePlotArea: false,
      itemclick: toogleDataSeries
    },
    data: [{
      type: "line",
      showInLegend: true,
      name: "Confirmados",
      markerType: "circle",
      xValueFormatString: "DD/MMM/YYYY",
      color: "#F08080",
      dataPoints: dataConfirmados
    },
    {
      type: "line",
      showInLegend: true,
      name: "Muertos",
      dataPoints: dataMuertos
    }]
  });
  chart.render();
  
  function toogleDataSeries(e){
    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else{
      e.dataSeries.visible = true;
    }
    chart.render();
  }
}


// funciones para esconder el login y mostrar el contenido
function domLogin() {
  $('#div-form').removeClass('d-block').addClass('d-none');
  $('#contenido').removeClass('d-none').addClass('d-block');
  $('#navChile').removeClass('d-block').addClass('d-none');
}

function situacionChile() {
  $('#div-form').removeClass('d-block').addClass('d-none');
  $('#contenido').removeClass('d-block').addClass('d-none');
  $('#navChile').removeClass('d-none').addClass('d-block');
}



// funcion para traer data de todos los paises, retorna array de objetos
async function getAllCountriesData() {
  try {
    const response = await fetch('http://localhost:3000/api/total');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
}

// funcion para traer data de un pais, retorna array de objetos
async function getCountryData(country) {
  try {
    const response = await fetch(
      ` http://localhost:3000/api/countries/${country}`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
}

//funcion para filtrar y ordenar la data, retorna array de objetos
async function moreThan10000() {
  try {
    const allCountriesData = await getAllCountriesData();

    const moreThan1000 = allCountriesData.filter(
      (country) => country.deaths >= 50000
    );

    const moreThan1000Sort = moreThan1000.sort((a, b) => b.deaths - a.deaths);
    console.log(moreThan1000Sort);
    return moreThan1000Sort;
  } catch (error) {
    console.error(error);
  }
}

// funcion para renderizar tabla con todos los paises
function renderTabla(dataCounries) {
  dataCounries.forEach((country) => {
    $('#tabla-body').append(`
        <tr>
            <th scope="row"> <div class="d-flex"><p class="mr-3">${country.location}</p><a class="link-primary link-modal" href="#" data-country=${country.location}>Ver detalle..</a></div></th>
            <td>${country.confirmed}</td>
            <td>${country.recovered}</td>
            <td>${country.active}</td>
            <td>${country.deaths}</td>
        </tr>
    `);
  });

  dataLink();
}
//funcion para abrir modal
function dataLink() {
  try {
    $('.link-modal').on('click', async function (event) {
      const country = $(this).attr('data-country');

      const dataCountry = await getCountryData(country);

      console.log(dataCountry);

      $('#country-modal').modal('show');
      

      iniciarGrafico([dataCountry], 'chartContainer-country');
    });
  } catch (error) {
    console.error(error);
  }
}

// funcion para renderizar el grafico principal
function iniciarGrafico(dataGrafico, container = 'chartContainer') {
  // datapoints
  const confirmados = [];
  const muertos = [];
  for (pais of dataGrafico) {
    confirmados.push({
      label: pais.location,
      y: pais.confirmed,
    });
    muertos.push({
      label: pais.location,
      y: pais.deaths,
    });
  }

  const covidData = [
    {
      type: 'column',
      name: 'Casos Muertos',
      legendText: 'Casos Muertos',
      showInLegend: true,
      dataPoints: muertos,
    },
    {
      type: 'column',
      name: 'Casos Confirmados',
      legendText: 'Casos Confirmados',
      showInLegend: true,
      dataPoints: confirmados,
    },
  ];

  let tituloGrafico = "Países con Covid19" 
  if (dataGrafico.length == 1) tituloGrafico = dataGrafico[0].location
  console.log(dataGrafico)
  const chart = new CanvasJS.Chart(container, {
    animationEnabled: true,
    title: {
      text: tituloGrafico,
    },
    axisY: {
      titleFontColor: '#4F81BC',
      lineColor: '#4F81BC',
      labelFontColor: '#4F81BC',
      tickColor: '#4F81BC',
    },
    toolTip: {
      shared: true,
    },
    legend: {
      cursor: 'pointer',
    },
    data: covidData,
  });

  console.log(chart.width, chart.height);

  chart.width = +chart.width + 40;
  chart.height = +chart.height + 40;

  $('.modal-dialog').css('max-width', chart.width);
  $('.modal-content').css('height', chart.height);

  chart.render();
}

/// login form
$('#login-form').on('submit', async function (event) {
  try {
    //Previene recarga de pag
    event.preventDefault();
    //Captura datos del formulario
    const email = $('#email-input').val();
    const password = $('#password-input').val();

    //primera llamada a api para solicitar Token
    const token = await getToken(email, password);

    //en caso de que las credenciales sean invalidas
    if (!token) {
      alert("Correo y/o contraseña incorrecta!")
      return $('.form-control').addClass('is-invalid')
    }

    //guarda token en localStorage
    localStorage.setItem('token', token);

    //esconde el login y muestra el contenido...
    domLogin();

    // render del grafico
    const graficoData = await moreThan10000();
    iniciarGrafico(graficoData);

    // render tabla
    const tablaData = await getAllCountriesData();
    renderTabla(tablaData);
  } catch (error) {
    console.log('Error');
    console.error(error);
  }
});
//funciones para logout button
$("#logout").on("click", function () {
    localStorage.removeItem("token");
    window.location.reload()
});

$("#logoutChile").on("click", function () {
  localStorage.removeItem("token");
  window.location.reload()
});

//funcion para ir a situacion chile 
$("#situacionChile").on("click", function () {
  situacionChile() 
});

//funcion para ir a home
$("#homeChile").on("click", function () {
  domLogin()
});



//funcion para recargar pagina home
(async function init () {
    const token = localStorage.getItem("token");
    if (token == null ) {
        return
    }
    else {
        try {            
            domLogin();
        
            // render del grafico
            const graficoData = await moreThan10000();
            iniciarGrafico(graficoData);
        
            // render tabla
            const tablaData = await getAllCountriesData();
            renderTabla(tablaData);
            graficoChile();
            } catch (error) {
                console.log('Error');
                console.error(error);
            }
    }
})();


