function createChart(yes, no) {
  new Highcharts.Chart({
    chart: {
      renderTo: 'CarbonvoteChart',
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    credits: {
      enabled: false
    },
    title: {
      text: 'Vote Status'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    series: [{
      name: 'Brands',
      colorByPoint: true,
      data: [{
        name: 'YES',
        y: yes
      }, {
        name: 'NO',
        y: no
      }]
    }],
    colors: ['green', 'red'],
  })
}

function ajaxLoad(url, callback) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
      if (xmlhttp.status == 200) {
        callback(xmlhttp.responseText)
      }
      else if (xmlhttp.status == 400) {
        console.log('There was an error 400');
      }
      else {
        console.log('something else other than 200 was returned');
      }
    }
  }

  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

(function() {
  ajaxLoad('/vote', function(res) {
    var data = JSON.parse(res)
    var yesVote = Number(data.yes)
    var noVote  = Number(data.no)

    var yes = Number(((yesVote / (yesVote + noVote)) * 100).toFixed())
    var no = 100 - yes

    createChart(yes, no)
  })
})()
