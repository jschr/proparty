#Propaty.js v0.1.0

Demos and documentation [here](http://jschr.github.com/proparty/)

Proparty is a small javascript library that makes defining CSS transitions and animations a breeze.

##The Basics

```js
pp('.example')
  .set('top', '80%')
  .setWithVendor('border-radius', '100px')
  .start();
```

##Multiple Values

```js
pp('.example')
  .set('top', ['80%', '60%'])
  .set('left', ['80%', '20%', '%50'])
  .start();
```

##Cycle

```js
pp('.example', { cycle: 7 })
  .set('top', ['80%', '60%', '%20', '40%'])
  .set('left', ['80%', '20%', '%50'])
  .start();
```

##Duration/Delay

```js
pp('.example')
  .setSettings({ duration: 1000, delay: 250, initialDelay: 500 })
  .set('padding', ['40px', '20px'])
  .set('opacity', ['0.5', '1.0'])
  .start();
```

##Easing

```js
pp('.example', { ease: 'in' })
 .set('top', '80%')
 .start();
```

##Transforms

```js
pp('.example')
  .set('top', ['80%', '30%', '50%'])
  .transform('rotateX', ['180deg', '360deg', '0deg'])
  .transform('rotateY', ['180deg', '0deg'])
  .start();
```

##Animations
```js
pp('.example')
  .setDuration(1000)
  .animate('twisterInDown')
  .start();
```

##Using Functions

```js
pp('.example')
  .setCycle(5)
  .set('top', function () { 
    return Math.floor((Math.random() * 80) + 1) + '%'; 
  })
  .transform('rotateX', [
    function () { return (this.inc + 1) * 15 + 'deg'; },
    function () { return (this.inc + 1) * 20 + 'deg'; },
  ])
  .start();
```

##Adding/Subtracting

```js
pp('.example')
  .setCycle(5)
  .set('top', pp.math.subtract('40px'))
  .set('left', pp.math.add('40px'))
  .start();
```

##Methods

```js
var ppExample = pp('.example')
  .setCycle(true)
  .set('top', ['15%', '85%', '85%', '15%'])
  .set('left', ['15%', '15%', '85%', '85%'])
  .set('background-color', function () { 
    return '#' + (Math.random().toString(16) + '000000').slice(2, 8); 
  });
  .start();


// pause transitions
ppExample.pause();

// stop transitions
ppExample.stop();

// destroy and call any queued up transitions
ppExample.destroy();
```

##Callbacks

```js
pp('.example')
  .setCycle(6)
  .transform('skew', ['20deg, 60deg', '-20deg, -60deg', '0deg, 0deg'])
  .transform('rotateY', ['180deg', '180deg', '0deg'])
  .whenStarted(function () { $('.text').html('Started!'); })
  .whenPaused(function () { $('.text').html('Paused!'); })
  .whenStopped(function () { $('.text').html('Stopped!'); })
  .start();
```

##Chaining

```js
pp('.example')
  .set('top', ['20%', '80%'])
  .set('left', '20%')
  .chain(function () {
    return pp('.example-two')
      .set('top', ['20%', '80%'])
      .set('left', '80%')
  })
  .start();
```

##Supported Browsers

Proparty supports all modern browsers with CSS transition support as well as IE9.

##Dependencies

None! Proparty is compatible with jQuery but does not require it.

##Roadmap

* Support for CSS3 animations.
* Allowing mulitple elements to be animated with the same instance.
* Forcing hardware acceleration to improve iOS performance.
* Reduce internal state to allow for branching off of transitions without mutatation.

##Credits

Proparty was inspired by [move.js](https://github.com/visionmedia/move.js), special thanks to the creators for an awesome library!

##License

Copyright (C) 2012-2013 Jordan Schroter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jschr/proparty/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

