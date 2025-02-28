<template>
    <div
        class="ww-video-dailymotion"
        :class="{ editing: isEditing }"
        role="region"
        aria-label="Dailymotion video player"
    >
        <div v-if="isLoading" class="ww-video-dailymotion__loading">
            <div class="loading-spinner"></div>
            Loading player...
        </div>
        <div v-else-if="error" class="ww-video-dailymotion__error">
            {{ error }}
        </div>
        <div v-show="!isLoading && !error" class="ww-video-dailymotion__player">
            <div :id="`dailymotion-player-${uniqueID}`"></div>
        </div>
    </div>
</template>

<script>
/**
 * @component ww-video-dailymotion
 * @description A WeWeb component for embedding and controlling Dailymotion videos
 */
export default {
    props: {
        /** Content object containing video configuration */
        content: { type: Object, required: true },
        /** Unique identifier for the component */
        uid: { type: String, required: true },
        /* wwEditor:start */
        /** Editor state object */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: ['update:content:effect', 'trigger-event'],
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
    data() {
        return {
            error: null,
            isLoading: false,
            player: null,
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
            if (!this.content.url) {
                this.error = 'Please provide a Dailymotion video URL';
                return null;
            }

            // Add stricter URL validation
            const validDailymotionUrl = /^https?:\/\/(www\.)?dailymotion\.com\/video\/[a-zA-Z0-9]+$/;
            if (!validDailymotionUrl.test(this.content.url)) {
                this.error = 'Invalid Dailymotion URL format';
                return null;
            }

            try {
                const match = this.content.url.match(/video\/([^?]+)/);
                if (!match) {
                    this.error =
                        'Invalid Dailymotion URL format. Expected format: https://www.dailymotion.com/video/VIDEO_ID';
                    return null;
                }
                this.error = null;
                return match[1];
            } catch (error) {
                this.error = 'Failed to parse Dailymotion URL';
                return null;
            }
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
    beforeDestroy() {
        this.cleanupPlayer();
    },
    methods: {
        /**
         * Handles the loading of the Dailymotion player script
         * @async
         */
        async handleScript() {
            try {
                this.isLoading = true;
                const scriptElement = wwLib.getFrontDocument().createElement('script');
                scriptElement.setAttribute('src', `https://geo.dailymotion.com/libs/player/${this.videoId}.js`);
                scriptElement.setAttribute('type', 'text/javascript');

                await new Promise((resolve, reject) => {
                    scriptElement.onload = resolve;
                    scriptElement.onerror = reject;
                    wwLib.getFrontDocument().body.appendChild(scriptElement);
                });

                await this.initPlayer();
            } catch (error) {
                this.error = 'Failed to load Dailymotion player';
                console.error('Script loading error:', error);
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Initializes the Dailymotion player
         * @async
         */
        async initPlayer() {
            if (!this.videoId) return;

            try {
                // Make sure the container exists
                const container = wwLib.getFrontDocument().getElementById(`dailymotion-player-${this.uniqueID}`);

                if (!container) {
                    throw new Error('Player container not found');
                }

                const player = await wwLib
                    .getFrontWindow()
                    .dailymotion.createPlayer(`dailymotion-player-${this.uniqueID}`, {
                        video: this.videoId,
                        params: {
                            startTime: this.content.videoStartTime,
                            mute: this.content.muted,
                            loop: this.content.loop,
                        },
                    });

                this.player = player;
                this.setupEventListeners(player);
            } catch (error) {
                console.error('initPlayer error:', error);
                this.error = 'Failed to initialize player';
                return wwLib.wwLog.error(error);
            }
        },

        /**
         * Sets up event listeners for the player
         * @param {Object} player - Dailymotion player instance
         */
        setupEventListeners(player) {
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
        },

        /**
         * Cleans up the player instance
         * @async
         */
        async cleanupPlayer() {
            try {
                if (this.player) {
                    await this.player.destroy();
                    this.player = null;
                }
            } catch (error) {
                console.error('Player cleanup error:', error);
            }
        },

        /**
         * Updates the current time variable
         * @param {number} currentTime - Current video time in seconds
         */
        updateCurrentTime(currentTime) {
            if (typeof currentTime !== 'number') return;
            this.setCurrentTimeValue(currentTime.toFixed(2));
        },

        /**
         * Updates the playing state and emits corresponding events
         * @param {boolean} isPlaying - Whether the video is playing
         */
        updateIsPlaying(isPlaying) {
            this.setIsPlayingValue(isPlaying);
            this.$emit('trigger-event', {
                name: isPlaying ? 'play' : 'pause',
                event: {},
            });
        },

        /**
         * Plays the video
         * @async
         */
        async playVideo() {
            try {
                const player = await wwLib
                    .getFrontWindow()
                    .dailymotion.getPlayer(`dailymotion-player-${this.uniqueID}`);
                if (player) {
                    await player.play();
                }
            } catch (error) {
                console.error('Play video error:', error);
            }
        },

        /**
         * Pauses the video
         * @async
         */
        async pauseVideo() {
            try {
                const player = await wwLib
                    .getFrontWindow()
                    .dailymotion.getPlayer(`dailymotion-player-${this.uniqueID}`);
                if (player) {
                    await player.pause();
                }
            } catch (error) {
                console.error('Pause video error:', error);
            }
        },

        /**
         * Seeks to a specific time in the video
         * @async
         * @param {number} time - Time in seconds to seek to
         */
        async seekTo(time) {
            try {
                const player = await wwLib
                    .getFrontWindow()
                    .dailymotion.getPlayer(`dailymotion-player-${this.uniqueID}`);
                if (player) {
                    await player.seek(time);
                }
            } catch (error) {
                console.error('Seek video error:', error);
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

    &__loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.05);
        color: #666;

        .loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #666;
            border-radius: 50%;
            margin-bottom: 10px;
            animation: spin 1s linear infinite;
        }
    }

    &__error {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        text-align: center;
        background: rgba(0, 0, 0, 0.05);
        color: #ff4444;
    }

    &__player {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;

        > div {
            width: 100%;
            height: 100%;
        }
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
