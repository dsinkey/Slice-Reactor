var React = require('react');
var GraphData = require('../stores/GraphDataStore');

var categoryPrice = function(array){
  var categoryNames= {};
  var JSONobj = [];
  array.forEach(function(item){
    var key = item.merchant.href;
    var value = item.orderTotal/100;
    categoryNames[key] = value;
  })
  JSONobj.push(categoryNames);
  return JSONobj;
};

var Donut = React.createClass({
  getInitialState: function(){
    var graphData = GraphData.getData();
    var data = categoryPrice(graphData);
    return {data: data}
  },
  componentDidMount: function(){
    this._renderChart(this.state.data);
  },
  _renderChart: function(dataset){
    var key = Object.keys(dataset[0]);
    var donutChart = c3.generate({
      bindto: '#chart_1',
      data: {
        json: dataset,
        keys: {
          value: key
        },
        type: 'donut'
      },
      legend: {
        position: 'right'
      },
        donut: {
          title: "Spending Trends"
      }
    })
  },
  render: function() {
    return (
      <div id="donut">
        <div className="graph-header">
          <h2>Spending by Category</h2>
        </div>
        <div id="chart_1"></div>
      </div>
    );
  }
});


module.exports = Donut;


