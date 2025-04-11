---
name: ww-video-dailymotion
description: A WeWeb component for embedding and controlling Dailymotion videos
keywords: video, dailymotion, player, embed, media
---

#### ww-video-dailymotion

***Purpose:***
A component that allows embedding Dailymotion videos with playback controls and event handling capabilities.

***Properties:***
- url (string): The Dailymotion video URL. Default: 'https://www.dailymotion.com/video/x84sh87'
- videoStartTime (number): Start time of the video in seconds. Default: 0
- muted (boolean): Whether the video should be muted. Default: true
- loop (boolean): Whether the video should loop. Default: false

***Events:***
- play: Triggered when video starts playing. Value is current time in seconds. Payload: {value: number}
- pause: Triggered when video is paused. Value is current time in seconds. Payload: {value: number}
- end: Triggered when video reaches the end. Value is current time in seconds. Payload: {value: number}

***Exposed Variables:***
- Is Playing (boolean): Indicates whether the video is currently playing (path: variables['current_element_uid-Is Playing'])
- Current time (number): Current playback time of the video in seconds (path: variables['current_element_uid-Current time])

***Exposed Element Actions:***
- playVideo: (no args) Play video
- pauseVideo: (no args) Pause video
- seekTo: (arg1 (time in seconds): number) Go to time
