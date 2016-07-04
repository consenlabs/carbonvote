
(function() {
  var chart = new Highcharts.Chart({
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
            y: 56.33
          }, {
            name: 'NO',
            y: 43.66,
          }]
      }],
      colors: ['#36a2eb', '#ff6384'],
  })

  // ajaxLoad('xx', function(res) {
  //   var yesResult = res.yes
  //   var noResult = res.no
  // })
  //
  // function ajaxLoad(url, callback) {
  //   var xmlhttp = new XMLHttpRequest();
  //
  //   xmlhttp.onreadystatechange = function() {
  //     if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
  //       if (xmlhttp.status == 200) {
  //         callback(xmlhttp.responseText)
  //       }
  //       else if (xmlhttp.status == 400) {
  //        console.log('There was an error 400');
  //       }
  //       else {
  //        console.log('something else other than 200 was returned');
  //       }
  //     }
  //   }
  //
  //   xmlhttp.open("GET", url, true);
  //   xmlhttp.send();
  // }
})()
