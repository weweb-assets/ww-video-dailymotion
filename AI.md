---
name: ww-video-dailymotion
description: A WeWeb component for embedding and controlling Dailymotion videos
keywords: video, dailymotion, player, embed, media
---

#### ww-video-dailymotion

A component that allows embedding Dailymotion videos with playback controls and event handling capabilities.

Properties:
- url (string): The Dailymotion video URL. Default: 'https://www.dailymotion.com/video/x84sh87'
- videoStartTime (number): Start time of the video in seconds. Default: 0
- muted (boolean): Whether the video should be muted. Default: true
- loop (boolean): Whether the video should loop. Default: false

Events:
- play: Triggered when the video starts playing
- pause: Triggered when the video is paused
- end: Triggered when the video ends

Variables:
- Is Playing (boolean): Indicates whether the video is currently playing
- Current time (number): Current playback time of the video in seconds

Actions:
- playVideo(): Starts playing the video
- pauseVideo(): Pauses the video
- seekTo(time: number): Seeks to a specific time in the video

Example:
```json
{
    "tag": "ww-video-dailymotion",
    "props": {
        "default": {
            "url": "https://www.dailymotion.com/video/x84sh87",
            "videoStartTime": 0,
            "muted": true,
            "loop": false
        }
    },
    "styles": {
        "default": {
            "width": "100%",
            "aspectRatio": "16/9"
        }
    }
}
```

The component creates an embedded Dailymotion player with a 16:9 aspect ratio by default and provides controls for video playback. It integrates with Dailymotion's player API to handle video events and control playback.
