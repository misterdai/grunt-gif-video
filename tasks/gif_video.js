/*
 * grunt-gif-video
 * http://github.com/misterdai/grunt-git-video
 *
 * Copyright (c) 2014 David Boyer
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

var async = require('async');
var chalk = require('chalk');
var ffmpeg = require('fluent-ffmpeg');
var gifyParse = require('gify-parse');
var gm = require('gm');

var replaceExt = function(filepath, newExt) {
  return path.join(
    path.dirname(filepath),
    path.basename(filepath, path.extname(filepath))
  ) + newExt;
};

module.exports = function (grunt) {
  grunt.registerMultiTask('gif_video', 'Converts animated GIF files to HTML5 compatible videos.', function () {
    var done = this.async();
    var files = this.files;
    var imagesComplete = 0;
    var options = this.options({
      limit: os.cpus().length,
      imageMagick: true,
      tmp: './.tmp',
      cleanup: true,
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
    });

    var parseGif = function(src, dest, next) {
      var gifBuff = fs.readFile(src, function(err, data) {
        if (err) {
          grunt.warn(chalk.red('✘ ') + err + ' parsing ' + src);
          return next(err);
        }
        var gifMeta = gifyParse.getInfo(data);
        grunt.verbose.writeln(chalk.green('✔ ') + src + chalk.gray(' (Parsed metadata)'));
        next(null, src, dest, gifMeta);
      });
    };

    var splitGif = function(src, dest, gifMeta, next) {
      if (!gifMeta.valid) {
        return next(new Error('GIF not valid'));
      }
      if (!gifMeta.animated) {
        return next(new Error('GIF not animated'));
      }
      var tmpFiles = path.join(options.tmp, src);
      tmpFiles = tmpFiles.replace(/\.gif$/, '_%d.gif');
      grunt.file.mkdir(path.dirname(tmpFiles));
      gm(src)
        .options({imageMagick: options.imageMagick})
        .write(tmpFiles, function(err) {
          if (err) {
            return next(err);
          }
          grunt.verbose.writeln(chalk.green('✔ ') + src + chalk.gray(' (Frame extraction)'));
          next(null, src, dest, gifMeta, tmpFiles);
        });
    };

    var glueGif = function(src, dest, gifMeta, tmpFiles, next) {
      var img = gm().options({imageMagick: options.imageMagick});
      gifMeta.images.forEach(function(frame, index) {
        // frame.delay = ms (0.001), gm delay = cs (0.01)
        var delay = frame.delay / 10;
        img.out('-delay', delay, tmpFiles.replace('%d', index));
      });
      var mpg = tmpFiles.replace(/_%d\.gif$/, '.mpg');
      grunt.file.mkdir(path.dirname(dest));
      img.out('-layers', 'Optimize')
        .write(mpg, function(err) {
          if (err) {
            return next(err);
          }
          grunt.verbose.writeln(chalk.green('✔ ') + src + chalk.gray(' (Merged to MPG)'));
          next(null, mpg, dest);
        });
    };

    var createVideos = function(mpg, dest, next) {
      async.eachSeries(Object.keys(options.ffmpeg),
        function(videoFormat, videoNext) {
          var destFile = replaceExt(dest, '.' + videoFormat);
          ffmpeg(mpg)
            .noAudio()
            .addOptions(options.ffmpeg[videoFormat])
            .output(destFile)
            .on('error', function(err, stdout, stderr) {
              grunt.warn(err + ' with file ' + mpg + ' to ' + videoFormat);
              videoNext();
            })
            .on('end', function() {
              grunt.verbose.writeln(chalk.green('✔ ') + mpg + chalk.gray(' (Converted to ' + videoFormat + ')'));
              videoNext();
            })
            .run();
        },
        function() {
          next(null, mpg);
        }
      );
    };

    var processGif = function(file, next) {
      var srcFile = file.src[0];
      var destFile = file.dest;
      async.waterfall([
          parseGif.bind(null, srcFile, destFile),
          splitGif,
          glueGif,
          createVideos
        ],
        function(err) {
          if (err) {
            grunt.verbose.writeln(chalk.red('✘ ') + srcFile + chalk.gray(' (Conversion failed)'));
            grunt.warn(err);
          } else {
            imagesComplete++;
            grunt.verbose.writeln(chalk.green('✔ ') + srcFile + chalk.gray(' (Conversion complete)'));
          }
          next();
        }
      );
    };

    async.eachLimit(
      files,
      options.limit,
      processGif,
      function(err) {
        if (options.cleanup) {
          grunt.verbose.writeln(chalk.yellow('Removing temporary directory ') + chalk.gray('(' + options.tmp + ')'));
          grunt.file.delete(options.tmp);
        }
        if (err) {
          return grunt.warn(err, err.stack);
        }

        var message = [
          chalk.cyan(files.length), ' image',
          (files.length === 1) ? 's' : '',
          ' found, ',
          chalk.green(imagesComplete),
          ' image', (imagesComplete === 1) ? 's' : '',
          ' converted.'
        ].join('');

        grunt.log.writeln(message);
        done();
      }
    );
  });
};