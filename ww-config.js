export default {
    options: {
        sizable: true,
    },
    editor: {
        label: {
            fr: 'Vidéo - Dailymotion',
            en: 'Vidéo - Dailymotion',
        },
        icon: 'logos/dailymotion',
    },
    actions: [
        { label: 'Play video', action: 'playVideo' },
        { label: 'Pause video', action: 'pauseVideo' },
        {
            label: 'Seek to',
            action: 'seekTo',
            args: [
                {
                    name: 'Time',
                    type: 'number',
                },
            ],
        },
    ],
    triggerEvents: [
        { name: 'play', label: { en: 'On play' }, event: { value: '' }, default: true },
        { name: 'pause', label: { en: 'On pause' }, event: { value: '' } },
        { name: 'end', label: { en: 'On end' }, event: { value: '' } },
    ],
    properties: {
        url: {
            path: 'url',
            label: { en: 'Video url', fr: 'Url de la vidéo' },
            type: 'Text',
            section: 'settings',
            options: {
                placeholder: 'Url',
            },
            bindable: true,
            defaultValue: 'https://www.dailymotion.com/video/x84sh87',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A dailymotion local video url: `"https://www.dailymotion.com/video/x84sh87"`',
            },
            /* wwEditor:end */
        },
        videoStartTime: {
            label: {
                en: 'Start time (s)',
            },
            type: 'Number',
            options: (_, sidepanelContent) => {
                return { min: 0, max: sidepanelContent.videoDuration };
            },
            section: 'settings',
            bindable: true,
            defaultValue: 0,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'A number that defines the video start time, in seconds: `42`',
            },
            /* wwEditor:end */
        },
        videoDuration: {
            editorOnly: true,
            defaultValue: 0,
            hidden: true,
        },
        // Need a dailymotion partner account to be customized (https://developers.dailymotion.com/player/#player-settings)
        // autoplay: {
        //     label: { en: 'Autoplay', fr: 'Lecture automatique' },
        //     type: 'OnOff',
        //     section: 'settings',
        //     defaultValue: false,
        //     /* wwEditor:start */
        //     bindingValidation: {
        //         type: 'boolean',
        //         tooltip: 'A boolean that defines if the video should start automatically: `true | false`',
        //     },
        //     /* wwEditor:end */
        // },
        // controls: {
        //     label: { en: 'Controls', fr: 'Contrôles' },
        //     type: 'OnOff',
        //     section: 'settings',
        //     defaultValue: true,
        // },
        muted: {
            label: { en: 'Muted', fr: 'Muet' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
        },
        loop: {
            label: { en: 'Loop', fr: 'Lecture en boucle' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
        },
        loopInfo: {
            label: { en: 'Loop Info' },
            type: 'Info',
            section: 'settings',
            options: {
                text: 'The player will loop your video or between recommendations depending on your <a href="https://www.dailymotion.com/partner/embed/players" target="_blank"><u>Player configuration</u></a>',
            },
        },
    },
};
