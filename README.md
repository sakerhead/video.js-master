# hola video.js - Enhanced HTML5 Video Player
hola video.js is a web video player based on the popular video.js open source project world. It supports HTML5 and Flash video. It supports video playback on desktops and mobile devices. hola video.js integrates advanced features from [holacdn.com](http://www.holacdn.com)

# [Video.js - HTML5 Video Player](http://videojs.com)
[![Build Status](https://travis-ci.org/videojs/video.js.svg?branch=master)](https://travis-ci.org/videojs/video.js)
[![Coverage Status](https://coveralls.io/repos/github/videojs/video.js/badge.svg?branch=master)](https://coveralls.io/github/videojs/video.js?branch=master)

## Features

- Commercial grade video player
- Integrated hola analytics module
- Integrated bandwidth saver module
- All the features of the original video.js
  - Custom branding (no watermark)
  - HLS/HDS streaming
  - HTML/CSS skin system
  - Plugin support
  - Multi platform (desktop and mobile devices)
  - Player API

## Quick start

To start using hola video.js, follow these steps:

1. Add these includes to your document's `<head>`:

  ```html
  <link href="https://cdn.rawgit.com/hola/video.js/4366bc45683330fe24d44a0ef9693b75b7d5ed13/dist/video-js.min.css" rel="stylesheet">
  <script src="https://cdn.rawgit.com/hola/video.js/4366bc45683330fe24d44a0ef9693b75b7d5ed13/dist/video.min.js"></script>
  ```

2. Add a `data-setup` attribute containing any hola video.js options to a `<video >` tag on your page. These options can include any hola video.js option plus potential plugin options, just make sure they're valid JSON!

  ```html
  <video id="really-cool-video" class="video-js vjs-default-skin" controls
   preload="auto" width="640" height="264" poster="really-cool-video-poster.jpg"
   data-setup='{}'>
    <source src="really-cool-video.mp4" type='video/mp4'>
    <source src="really-cool-video.webm" type='video/webm'>
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading
       to a web browser that supports HTML5 video
    </p>
  </video>
  ```

3. Done!

If you're ready to dive in, the documentation is the first place to go for more information.

## Integrated video analytics

hola video.js comes integrated with the free hola video analytics module. To open your free account and have access to the analytics dashboard, check out holacdn.
Hola analytics module provides the following information using the free dashboard:
- Start buffering times
- Total views
- Total minutes viewed
- Seek events
- Bandwidth saved using Bandwidth Saver
- And more..

The use of this feature requires a free hola account. To learn more about the hola analytics dashboard and to create your free account, visit [www.holacdn.com](www.holacdn.com).

## Integrated bandwidth saver for progressive http

hola video.js comes integrated with the free hola bandwidth saver module. The bandwidth saver module uses progressive download methods to reduce buffer overhead while keeping the video loading time to a minimum and the player responsive.
Bandwidth saver works with MP4/FLV streams.

## Prebuilt Hola video.js packages

[Hola Video.js, zip (1.8MB)](https://github.com/hola/video.js/releases/download/hola_5.0.2-10/videojs-5.0.2-10.zip) – basic Hola Video.js.

[Hola Video.js + HLS, zip (2.04MB)](https://github.com/hola/video.js/releases/download/hola_5.0.2-10/videojs-hls-5.0.2-10.zip) – Hola Video.js + HLS plugin.

[Hola Video.js + OSMF, zip (2.09MB)](https://github.com/hola/video.js/releases/download/hola_5.0.2-10/videojs-osmf-5.0.2-10.zip) – Hola Video.js + OSMF plugin.

[All files, zip (14.1MB)](https://github.com/hola/video.js/releases/download/hola_5.0.2-10/videojs-full-5.0.2-10.zip) – all Hola Video.js prebuilt files, including examples.

## Examples

[Basic example](http://output.jsbin.com/pefiyoyuma/1)

[Basic HLS example](http://output.jsbin.com/logazoxaci/1)

[Basic OSMF example](http://output.jsbin.com/napusasenu/1)

## Building your own copy of Hola Video.js

If you want to build your own copy of Hola Video.js and receive the latest updates follow these instructions:

First, [fork](http://help.github.com/fork-a-repo/) the hola/video.js git repository. At the top of every github page, there is a Fork button. Click it, and the forking process will copy Hola Video.js into your own GitHub account.

Clone your fork of the repo into your code directory

```bash
git clone https://github.com/<your-username>/video.js.git
```

Navigate to the newly cloned directory

```bash
cd video.js
```

Assign the original repo to a remote called "upstream"

```
git remote add upstream https://github.com/hola/video.js.git
```

>In the future, if you want to pull in updates to video.js that happened after you cloned the main repo, you can run:
>
> ```bash
> git checkout master
> git pull upstream master
> ```

Install the required node.js modules using node package manager

```bash
npm install
```

> A note to Windows developers: If you run npm commands, and you find that your command prompt colors have suddenly reversed, you can configure npm to set color to false to prevent this from happening.
> `npm config set color false`
> Note that this change takes effect when a new command prompt window is opened; the current window will not be affected.

Build a local copy of video.js

```bash
grunt dist
```
Look at the [CONTRIBUTING.md file](CONTRIBUTING.md#building-your-own-copy-of-videojs) for the details.

## License

hola video.js is licensed under the Apache License, Version 2.0. [View the license file](LICENSE)

Copyright 2015 Hola Networks ltd
