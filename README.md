
# Application purpose

This application allows a quick comparison of N amount of encoded videos with the original using VMAF score metric, find those with the highest delta between frames score and export them as one image with side-by-side frames from each video.

## Installation

```bash
git clone https://github.com/maciej-kulon/vmaf-diff.git
npm install
```

## Usage

Example command:

```bash
ts-node ./src/console.ts compare -o originalVideo.mp4 -d distortedVideo1.mp4 distortedVideo2.mp4 -c 2
```

## Options

```bash
[required] -o, --original: path to original video file.
```

```bash
[required] -d, --distorted: paths to distorted videos separated bu space. Amount of distorted videos is unlimited.
```

```bash
[optional] -c, --count: Amount of frames to export. Default value is set to 3.
```
