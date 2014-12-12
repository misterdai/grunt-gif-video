# grunt-gif-video

> Converts animated GIF files to HTML5 compatible videos.

[![Dependency Status](https://david-dm.org/misterdai/grunt-gif-video.png?style=flat-square)](https://david-dm.org/misterdai/grunt-gif-video)
[![devDependency Status](https://david-dm.org/misterdai/grunt-gif-video/peer-status.png?style=flat-square)](https://david-dm.org/misterdai/grunt-gif-video#info=devDependencies)

[![NPM](https://nodei.co/npm/grunt-gif-video.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/grunt-gif-video/)

This plugin will take the specified animated `.gif` files and process them into HTML5 compatible videos.  Certain animated GIF's are quite large, but when they are converted to video files they take up a lot less space.  With this plugin, you could provide the videos with a fallback to the original animated `.gif` if the HTML5 video is not supported by the browser.

```
Original example GIF: 1.9 MB
MP4 Video:  351 KB
OGV Video:  100 KB
WEBM Video: 165 KB
```

One more important feature of this plugin, is the fact it retains the individual frame delay.  If your GIF has frames with different durations, they will be carried over to the video versions intact.

## Example HTML usage after conversion

```html
<video autoplay>
  <source src="/imgs/aha.mp4" type="video/mp4">
  <source src="/imgs/aha.webm" type="video/webm">
  <source src="/imgs/aha.ogv" type="video/ogg">
  <img src="/imgs/aha.gif">
</video>
```

## Getting Started

This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-gif-video --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-gif-video');
```

### Other requirements

Without the following requirements fulfilled, the conversion will fail.

#### ImageMagick / GraphicsMagick

To split the `.gif` files apart into their individual frames, this plugin uses the [gm](http://aheckmann.github.io/gm/) module.  Which requires that you have either [ImageMagick](http://www.imagemagick.org/) or [GraphicsMagick](http://www.graphicsmagick.org/) installed and available.  This plugin provides an option to configure which image processing tool to use.

#### FFMpeg

Once the `.gif` file has been split and rejoined as an `.mpg`, it uses [FFMpeg](https://www.ffmpeg.org/) to convert the temporary video into other formats (by default, supported HTML5 Video types).  You need to make sure your system has it available globally or a path to it set as the environmental variable `FFMPEG_PATH`.

## The "gif_video" task

### Overview

In your project's Gruntfile, add a section named `gif_video` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  gif_video: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### limit

Type: `Number`
Default: `require('os').cpus().length`

Sets the concurrency limit for processing the images into videos.  By default this will match the number of CPU's.

#### imageMagick

Type: `Boolean`
Default: `true`

Specifies if ImageMagick is used, otherwise it will try to use GraphicsMagick.

#### tmp

Type: `String`
Default: `./.tmp`

Temporary directory to hold the exploded `.gif` frame files and source video.

#### cleanup

Type: `Boolean`
Default: `true`

Determines if the temporary directory used for the conversion process, will be deleted or not once the task has finished.

#### ffmpeg

Type: `Object`
Default:

```javascript
ffmpeg: {
  mp4: [
    '-vcodec libx264',
    '-pix_fmt yuv420p',
    '-profile:v baseline',
    '-preset slower',
    '-crf 18',
    '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2'
  ],
  ogv: [
    '-q 5',
    '-pix_fmt yuv420p',
    '-vcodec libtheora'
  ],
  webm: [
    '-c:v libvpx',
    '-pix_fmt yuv420p',
    '-quality good',
    '-crf 10'
  ]
}
```

A hash of video extensions and their respective FFMpeg command arguments for the conversion.  Currently if you specify this option, it will override all of the default video settings.    

### Usage Examples

#### Convert all within a single directory

The following configuration would convert all the `.gif` files with the specified directory.  The video files would then be placed in the destination directory.  Please note that the original `.gif` file __is not__ copied across (may be configurable at some point).

```javascript
grunt.initConfig({
  gif_video: {
    animated: {
      options: {},
      files: [{
        expand: true,
        cwd: 'src/imgs/animated',
        src: ['*.gif'],
        dest: 'build/imgs/animated'
      }]
    }
  }
});
```

### Debugging

If you are having problems with this plugin and they aren't clear what they are, try enabling verbose messages for `grunt`.

```shell
grunt --verbose
```

Also, it may be useful to retain the temporary directory that's used for conversion and change the `limit` option to 1, so the messages are displayed in a readable sequence.

```javascript
options: {
  cleanup: false,
  limit: 1
}
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Donating

If you found this plugin useful and would like to see it's development progress, please consider making a donation of any size you wish.  Think of it as buying me a virtual beer to say thanks ;)

[![Gratipay Mister Dai](http://img.shields.io/gratipay/misterdai.png)](http://img.shields.io/gratipay/misterdai.png)

BTC: `1Eob4jWj3E5cAcF2bB3hKwVwLAJyErZGWS`

## Roadmap

 * Clear up temporary directories and files.
 * Option to copy across original animated `.gif`.
 * Add support to generate a poster image (first frame of the animation), as a placeholder on the `<video>` tag.
 * Improve `ffmpeg` option to make it more flexible.
 * Generate `.json` file containing conversion information (files, dimensions, sizes).
 * Generate `.html` snippet files to easily include the HTML for GIF/Video insertion.
 * Improve tests.
 * Better examples.
 * Possible `minsize` option, to only process large files.

## Release History

 * 2014-12-12   v0.1.0   Initial release.
 
## License

Copyright (c) 2014 David Boyer. Licensed under the MIT license.
