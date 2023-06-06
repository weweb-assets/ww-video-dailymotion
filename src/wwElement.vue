<template>
    <div class="ww-video-dailymotion" :class="{ editing: isEditing }">
        <div class="ww-video-dailymotion__player" :id="`dailymotion-player-${uniqueID}`"></div>
    </div>
</template>

<script>
export default {
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['update:content:effect'],
    setup(props) {
        const uniqueID = props.uid.split('-')[0];
        const { variableValue: isPlayingVariableValue, setValue: setIsPlayingValue } =
            wwLib.wwVariable.useComponentVariable({
                uid: props.uid,
                name: 'Is Playing',
                type: 'boolean',
                defaultValue: false,
                readonly: true,
            });
        const { variableValue: currentTimeVariableValue, setValue: setCurrentTimeValue } =
            wwLib.wwVariable.useComponentVariable({
                uid: props.uid,
                name: 'Current time',
                type: 'number',
                defaultValue: 0,
                readonly: true,
            });

        return {
            uniqueID,
            isPlayingVariableValue,
            setIsPlayingValue,
            currentTimeVariableValue,
            setCurrentTimeValue,
        };
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        videoId() {
            if (!this.content.url) return {};
            return this.content.url.split('video/')[1].split('?')[0];
        },
    },
    watch: {
        isEditing() {
            this.initPlayer();
        },
        content: {
            deep: true,
            handler() {
                this.initPlayer();
            },
        },
    },
    mounted() {
        this.handleScript();
    },
    methods: {
        async handleScript() {
            const scriptElement = wwLib.getFrontDocument().createElement('script');
            scriptElement.setAttribute('src', `https://geo.dailymotion.com/libs/player/${this.uniqueID}.js`);
            scriptElement.setAttribute('type', 'text/javascript');
            wwLib.getFrontDocument().body.appendChild(scriptElement);

            scriptElement.onload = () => {
                this.initPlayer();
            };
        },
        async initPlayer() {
            wwLib.getFrontWindow();
            dailymotion
                .createPlayer(`dailymotion-player-${this.uniqueID}`, {
                    video: this.videoId,
                    params: {
                        startTime: this.content.videoStartTime,
                        mute: this.content.muted,
                        loop: this.content.loop,
                    },
                })
                .then(player => {
                    player.on(dailymotion.events.VIDEO_PLAY, () => {
                        this.updateIsPlaying(true);
                    });
                    player.on(dailymotion.events.VIDEO_PAUSE, () => {
                        this.updateIsPlaying(false);
                    });
                    player.on(dailymotion.events.VIDEO_END, () => {
                        this.updateIsPlaying(false);
                        this.$emit('trigger-event', { name: 'end', event: {} });
                    });
                    player.on(dailymotion.events.VIDEO_TIMECHANGE, event => {
                        this.updateCurrentTime(event.videoTime);
                    });
                })
                .catch(e => wwLib.wwLog.error(e));
        },
        updateCurrentTime(currentTime) {
            if (typeof currentTime !== 'number') return;
            this.setCurrentTimeValue(currentTime.toFixed(2));
        },
        updateIsPlaying(isPlaying) {
            this.setIsPlayingValue(isPlaying);
            if (isPlaying) {
                this.$emit('trigger-event', { name: 'play', event: {} });
            } else {
                this.$emit('trigger-event', { name: 'pause', event: {} });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-video-dailymotion {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;

    &.editing {
        pointer-events: none;
    }

    &__player {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
    }
}
</style>
