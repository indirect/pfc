wesabe.$class('views.widgets.SeriesChart', wesabe.views.widgets.BaseWidget, function($class, $super, $package) {
  // import jQuery as $
  var $ = jQuery;

  $.extend($class.prototype, {
    chartInset: null,

    xValueFormatter: function() {
      return this._xValueFormatter || {
        format: function(value){ return ''+value; }
      };
    },

    setXValueFormatter: function(xValueFormatter) {
      this._xValueFormatter = xValueFormatter;
    },

    yValueFormatter: function() {
      return this._yValueFormatter || {
        format: function(value){ return ''+value; }
      };
    },

    setYValueFormatter: function(yValueFormatter) {
      this._yValueFormatter = yValueFormatter;
    },

    /**
     * @private
     */
    _canvas: null,
    /**
     * @private
     */
    _maxYValue: null,
    /**
     * @private
     */
    _series: null,

    init: function(element) {
      $super.init.call(this, element || $('<div></div>'));

      this._series = [];
    },

    addSeries: function(series) {
      this._series.push(series);

      for (var i = 0; i < this._series.length; i++) {
        var data = this._series[i].data;

        for (var j = 0; j < data.length; j++) {
          if (data[j].y > this._maxYValue)
            this._maxYValue = data[j].y;
        }
      }

      this.setNeedsRedraw(true);
    },

    clearSeries: function() {
      this._series = [];
      this.setNeedsRedraw(true);
    },

    setChartInset: function(chartInset) {
      this.chartInset = chartInset;
      this.setNeedsRedraw(true);
    },

    redraw: function() {
      $super.redraw.call(this);

      if (!this._canvas)
        this._canvas = Raphael(this.get('element').get(0), this.get('contentWidth'), this.get('contentHeight'));

      this._canvas.clear();

      this._drawGrid();
      this._drawSeriesData();
      this._drawLabels();
    },

    _drawLabels: function() {
      var gridLines = 6,
          canvas = this._canvas,
          chartRect = this.get('chartRect'),
          height = chartRect.size.height,
          x0 = 45,
          x1 = this.get('contentWidth')-45;

      for (var i = gridLines-1; i > 0; i--) {
        var y = (i-1)*(height/(gridLines-1)),
            value = (gridLines-i)/(gridLines-1) * this._maxYValue,
            textValue = this.get('yValueFormatter').format(value);

        canvas.text(x0, y+8, textValue).attr('text-anchor', 'end');
        canvas.text(x1, y+8, textValue).attr('text-anchor', 'start');
      }

      if (this._series.length == 0)
        return;

      var chartBottom = chartRect.origin.y+chartRect.size.height,
          y = chartBottom+7,
          barWidth = 20,
          xSpacing = (barWidth / 2) * (this._series.length + 2) + 2,
          data = this._series[0].data;

      for (var i = 0; i < data.length; i++) {
        var datum = data[i],
            x0 = chartRect.origin.x+(i * xSpacing),
            textValue = this.get('xValueFormatter').format(datum.x, i, data.length);

        var text = canvas.text(0, y, textValue),
            textBox = text.getBBox();

        text.attr({
          x: x0+(((this._series.length+1)*barWidth/2) - textBox.width) / 2,
          y: y + textBox.height/2
        });
      }
    },

    _drawGrid: function() {
      var gridLines = 6,
          canvas = this._canvas,
          height = this.get('chartRect').size.height,
          x0 = 0,
          x1 = this.get('contentWidth');

      for (var i = 0; i < gridLines; i++) {
        var y = i*(height/(gridLines-1));
        canvas.path('M'+x0+' '+y+'L'+x1+' '+y).attr({
          stroke: 'rgb(229,229,229)',
          'stroke-width': 0.5
        });
      }
    },

    _drawSeriesData: function() {
      var barWidth = 20,
          xSpacing = (barWidth / 2) * (this._series.length + 2) + 2;

      for (var i = this._series.length; i--; ) {
        var series = this._series[i],
            data = series.data,
            color = series.color;

        for (var j = 0; j < data.length; j++) {
          var datum = data[j];

          this._addBar(j*xSpacing + i*barWidth/2 /* half overlap */, datum.y, color);
        }
      }
    },

    chartRect: function() {
      var inset = this.get('chartInset');

      return {
        origin: {
          x: inset.left,
          y: inset.top
        },
        size: {
          width: this.get('contentWidth') - inset.left - inset.right,
          height: this.get('contentHeight') - inset.top - inset.bottom
        }
      };
    },

    _addBar: function(offset, value, color) {
      var chartRect = this.get('chartRect'),
          width = 20.0,
          x = chartRect.origin.x + offset - width/2.0,
          height = chartRect.size.height * (value / this._maxYValue),
          y = chartRect.origin.y + chartRect.size.height - height;

      var rect = this._canvas.rect(x, y+height, width, 0);
      rect.attr({fill: color, stroke: 'none'});
      rect.animate({height: height, y: y}, 500);
    }
  });
});
