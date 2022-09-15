<template>
    <div class="ww-video-dailymotion" :class="{ editing: isEditing }" :key="componentKey">
        <div class="ww-video-dailymotion__player" :id="`dailymotion-player-${uniqueID}`"></div>
    </div>
</template>

<script>
import { nextTick } from 'vue';

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
        const uniqueID = wwLib.wwUtils.getUniqueId();
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
    data() {
        return {
            componentKey: 0,
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
        'content.url'() {
            this.initPlayer();
        },
        'content.videoStartTime'() {
            this.initPlayer();
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
            this.componentKey += 1;

            await nextTick();

            const dailymotion = wwLib.getFrontWindow().dailymotion;
            this.player = await dailymotion.createPlayer(`dailymotion-player-${this.uniqueID}`, {
                video: this.videoId,
                params: {
                    startTime: this.content.videoStartTime,
                    loop: this.content.loop,
                    mute: this.content.muted,
                    enable_controls: this.content.controls,
                },
            });

            if (!this.content.autoplay) this.player.pause();

            /* wwEditor:start */
            player.on(dailymotion.events.VIDEO_PLAY, () => {
                this.updateIsPlaying(true);
            });
            player.on(dailymotion.events.VIDEO_PAUSE, () => {
                this.updateIsPlaying(false);
            });
            player.on(dailymotion.events.VIDEO_END, () => {
                this.$emit('trigger-event', { name: 'end', event: {} });
            });
            player.on(dailymotion.events.VIDEO_TIMECHANGE, event => {
                this.updateCurrentTime(event.videoTime);
            });
            /* wwEditor:end */
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
