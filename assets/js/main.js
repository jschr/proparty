$(function () {
  prettyPrint();

  $('.jumbotron h1').fitText(0.8, { minFontSize: 50, maxFontSize: 110 });

  // title
  for (var i = 1; i <= 8; i++) {
    pp('.char' + i, { duration: 10000, initialDelay: (400 * i), cycle: true, ease: 'out' })
    .set('color', [ '#C7F464', '#FF6B6B', '#C44D58' ])
    .start();
  }

  // easing types
  var types = ['in', 'out', 'in-out', 'linear', 'snap', 'ease-in-quad', 'ease-in-cubic', 'ease-in-quart', 'ease-in-quint', 'ease-in-sine', 'ease-in-expo', 'ease-in-circ', 'ease-in-back', 'ease-out-quart', 'ease-out-quint', 'ease-out-sine', 'ease-out-expo', 'ease-out-circ', 'ease-out-back', 'ease-out-quad', 'ease-out-cubic', 'ease-in-out-quart', 'ease-in-out-quint', 'ease-in-out-sine', 'ease-in-out-expo', 'ease-in-out-circ', 'ease-in-out-back'];

  $('#easingSelect')
    .html(types.map(function (x){ return '<option value="' + x + '">' + x + '</option>'; }))
    .on('change', function () {
      var selected = $(this).val();
      $('#easingCode').text([
        'pp(\'.example\', { ease: \'' + selected + '\' })',
        ' .set(\'top\', \'80%\')',
        ' .start();'
      ].join('\n'));
      prettyPrint();
    })
    .change();

  var demos = {
    basic: function (demo) {
      return demo
        .set('top', '80%')
        .setWithVendor('border-radius', '100px');
    },
    multi: function (demo) {
      return demo
        .set('top', ['80%', '60%'])
        .set('left', ['80%', '20%', '50%']);
    },
    cycle: function (demo) {
      return demo
        .setCycle(7)
        .set('top', ['80%', '60%', '20%', '40%'])
        .set('left', ['80%', '20%', '50%']);
    },
    timing: function (demo) {
      return demo
        .setSettings({ duration: 1000, delay: 250, initialDelay: 500 })
        .set('padding', ['40px', '20px'])
        .set('opacity', ['0.5', '1.0']);
    },
    ease: function (demo, ease) {
      return demo
        .setEase(ease)
        .set('top', '80%');
    },
    transforms: function (demo) {
      return demo
        .set('top', ['80%', '30%', '50%'])
        .transform('rotateX', ['180deg', '360deg', '0deg'])
        .transform('rotateY', ['180deg', '0deg']);
    },
    functions: function (demo) {
      return demo
        .setCycle(5)
        .set('top', function () { 
          return Math.floor((Math.random() * 80) + 1) + '%'; 
        })
        .transform('rotate', [
          function () { return (this.inc + 1) * 45 + 'deg'; },
          function () { return (this.inc + 1) * 90 + 'deg'; },
        ]);
    },
    addsub: function (demo) {
      return demo
        .setCycle(5)
        .set('top', pp.math.subtract('40px'))
        .set('left', pp.math.add('40px'));
    },
    methods: function (demo) {
      return demo
        .setCycle(true)
        .set('top', ['15%', '85%', '85%', '15%'])
        .set('left', ['15%', '15%', '85%', '85%'])
        .set('background-color', function () { 
          return '#' + (Math.random().toString(16) + '000000').slice(2, 8); 
        });
    },
    callbacks: function (demo) {
      return demo
        .setCycle(6)
        .transform('skew', ['20deg, 60deg', '-20deg, -60deg', '0deg, 0deg'])
        .transform('rotateY', ['180deg', '180deg', '0deg'])
        .whenStarted(function () { $('.demo-text').html('Started!'); })
        .whenPaused(function () { $('.demo-text').html('Paused!'); })
        .whenStopped(function () { $('.demo-text').html('Stopped!'); });
    },
     chaining: function (demo1, ease, demo2) {
      return demo1
        .set('top', ['20%', '80%'])
        .set('left', '20%')
        .chain(function () {
          return demo2
            .set('top', ['20%', '80%'])
            .set('left', '80%')
        });
    }
  };

  var ppDemo1;
  var ppDemo2;

  $('.play').on('click', function () {
    var demo = $(this).data('play');

    $('.demo').attr('style', '');
    $('.demo-text').text('');

    $('.demo-controls')[$(this).data('controls') ? 'show' : 'hide']();

    $('.demo-controls .toggle')
        .data('toggle', 'pause')
        .text('Pause');

    $('.demo-container').toggleClass('multiple', !!$(this).data('multiple'));

    pp('.demo-container')
      .whenStarted(function () {
        $(this.element).show();
      })
      .set('opacity', 1)
      .chain(function () {
        console.log('chain 1')
        ppDemo1 = pp('.demo-one');
        ppDemo2 = pp('.demo-two');
        return demos[demo](ppDemo1, $('#easingSelect').val(), ppDemo2)
          .chain(function () {
            console.log('chain 2')
            return pp('.demo-container')
              .set('opacity', 0)
              .whenDestroyed(function () {
                console.log('chain end');
                $(this.element).hide();
              });
          });
      })
      .start();
  });

  $('.toggle').on('click', function () {
    var $this = $(this);
    var type = $this.data('toggle');

    if (type === 'pause') {
      ppDemo1.pause();
      ppDemo2.pause();
      $this
        .data('toggle', 'start')
        .text('Start');
    } else {
      ppDemo1.start();
      ppDemo2.start();
      $this
        .data('toggle', 'pause')
        .text('Pause');
    }
  });

  $('.stop').on('click', function () {
    ppDemo1.stop();
    ppDemo2.stop();
    $('.toggle')
      .data('toggle', 'start')
      .text('Start');
  });

  $('.destroy').on('click', function () {
    ppDemo1.destroy();
    ppDemo2.destroy();
    $('.toggle')
      .data('toggle', 'start')
      .text('Start');
  });

  // pp('.example', { cycle: true })
  //   .set('font-size', [ '150%', '450%', '75%' ])
  //   // .set('background-color', [ '#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58' ])
  //   .set('background-color', function () { return '#' + (Math.random().toString(16) + '000000').slice(2, 8); })
  //   .set('padding', [ '20px', '50px' ])
  //   .transform('rotateX', [ '180deg', '0deg', '0deg', '180deg' ])
  //   .transform('rotateY', [ '180deg', '0deg', '0deg', '180deg' ])
  //   .start();

  // pp('.example', { delay: 1000, duration: 500, cycle: true })
  //   .setWithVendor('border-radius', [ '0px', '20px', '80px' ])
  //   .start();

  // pp('.example', { duration: 750, cycle: true, ease: 'snap' })
  //   // .set('top', pp.add([ '5%', '5%', '10%', '20%' ]))
  //   // .set('left', [ '20%', '20%', '40%', '40%' ])
  //   .set('top', [ '25%', '50%', '35%', '40%' ])
  //   .set('left', [ '50%', '25%', '60%' ])
  //   // .set('top', function () { return Math.floor((Math.random() * 90) + 1) + '%'; })
  //   // .set('left', function () { return Math.floor((Math.random() * 90) + 1) + '%'; })
  //   .whenStarted(function () { console.log('start!'); })
  //   .whenPaused(function () { console.log('paused!'); })
  //   .whenStopped(function () { console.log('stopped!'); })
  //   .start()

});