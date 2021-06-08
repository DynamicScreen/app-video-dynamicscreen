<template>
  <div>
    <div class="slide-content" ref="container">
      <div id="samsung-sssp-backdrop" :class="{ 'under-bottom-bar': showBottomBar}" class="video-player test" v-if="isUsingFloatingVideo"></div>
      <video ref="video" v-if="!isUsingFloatingVideo" id="video" crossorigin="anonymous"
             v-show="videoLoaded"
             class="video-player"
             :class="{ 'under-bottom-bar': showBottomBar}"
             :src="url"
             :style="videoStyle"
      >
        <track v-if="subtitle !== null" :src="subtitle" kind="subtitles" srclang="en" label="English" default>
      </video>
    </div>
  </div>
</template>

<style scoped>
.under-bottom-bar {
  z-index: 0 !important;
}
.slide-content {
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-player {
  max-width: 100%;
  max-height: 100%;
  height: 100%;
  background-color: #000;
  z-index: 10;
}
</style>

<script>
import {instMediaManager} from "mediaManager";
import {findMedias} from "utils/functions";
import {instDatabase} from "database";
import { mapState, mapGetters } from 'vuex';

export default {
  props: ['slide', 'index', 'isSingle'],
  data() {
    return {
      url: null,
      player: null,
      db: null,
      videoLoaded: false,
      forcingPlay: false,
      buffer: null,
      oldBlobUrl: null,
      screenReloadTimeout: null,
      subtitle: null,
      initialized: false,
      // screenOnEndedTimeout: null,
      hasBeenInitialized: false,
    }
  },
  mounted() {
    // this.initSlideVideo();
    // this.initialized = true;
  },
  activated() {
    this.initSlideVideo();
    this.$events.on('togglePauseSlider', this.togglePauseVideo)
  },
  deactivated() {
    console.debug("Slides Essentials: Video: deactivated");
    if (this.isUsingFloatingVideo) {
      window.$host.askToStopFloatingVideo({media: this.media.id, id: this.slide.id});
      this.$events.off("floating-video-stopped");
    } else {
      this.player.pause();
      if (!this.media.cachedUrl) {
        URL.revokeObjectURL(this.player.src);
      }

      this.player.removeEventListener('canplaythrough', this._canPlayThrough);
      this.player.removeEventListener('ended', this.onEnded);
      this.player.removeEventListener('waiting', this.onWaiting);
      this.player.removeEventListener('playing', this.onPlaying);
      this.player.removeEventListener('error', this.onPlayerError);
    }
    this.$events.off('togglePauseSlider');
  },
  beforeDestroy() {
    console.debug("Slides Essentials: Video: beforeDestroy");
    if (this.isUsingFloatingVideo) {
      window.$host.askToStopFloatingVideo({media: this.media.id, id: this.slide.id});
      this.$events.off("floating-video-stopped");
    } else {
      this.player.pause();
      this.player.src = '';
      this.player.load();
    }
  },
  watch: {
    slide(newSlide, oldSlide) {
      if (newSlide.data.media.url !== oldSlide.data.media.url) {
        window.$logger.log("Slides Essentials: Video: detected video file change");
        if (!this.isUsingFloatingVideo) {
          URL.revokeObjectURL(this.player.src);
        }
        this.loadAsset(this.newSlide.data.media.id);
      }
    }
  },
  methods: {
    initSlideVideo() {
      this.initPlayer();
      if (!this.media.cachedUrl) {
        this.loadAsset(this.media.id);
      } else {
        instMediaManager.lastUseMediaUpdating(this.media.id)
      }
      this.url = this.media.cachedUrl || this.media.url
      this.setVideoUrl(this.url);
    },
    initPlayer() {
      window.$logger.log("Slides Essentials: Video: init video player");
      if (this.isUsingFloatingVideo) {
        // if (this.hasBeenInitialized) {
        //     return;
        // }
        // this.hasBeenInitialized = true;

        window.$logger.log("Slides Essentials: Video: Binding floating-video-stopped event");
        this.$events.off("floating-video-stopped");
        this.$events.on("floating-video-stopped", this.onFloatingVideoStopped.bind(this));

        return;
      }
      this.player = this.$refs.video;
      this.player.addEventListener('canplaythrough', this._canPlayThrough);
      this.player.addEventListener('ended', this.onEnded);
      this.player.addEventListener('waiting', this.onWaiting);
      this.player.addEventListener('playing', this.onPlaying);
      this.player.addEventListener('error', this.onPlayerError);

      this.player.preload = "auto";
      this.player.volume = parseInt(this.slide.data.volume) / 100
      this.player.muted = this.slide.data.mute === "1";
    },
    onEnded() {
      window.$logger.log("Slides Essentials: Video: playback ended");
      if (this.isSingle && !this.slide.triggerable) {
        window.$logger.log("Slides Essentials: Video: Single slide, play video again");
        if (this.isUsingFloatingVideo) {
          this.startVideo();
        } else {
          this._canPlayThrough()
        }
      } else {
        window.$logger.log("Slides Essentials: Video: Go to next slide");
        this.$events.emit('nextSlide');
      }
    },
    onFloatingVideoStopped({ video }) {
      window.$logger.log("Slides Essentials: Video: Floating video stopped. This ID : " + this.slide.id.toString() + ". Payload: " + JSON.stringify(video));
      if ("id" in video && video.id.toString() === this.slide.id.toString()) {
        window.$logger.log("Slides Essentials: Video: This video has been stopped");
        this.videoLoaded = false;
        this.onEnded();
      }
    },
    startVideo() {
      this.$events.emit('pauseSlider');
      if (this.isUsingFloatingVideo) {
        let rect = this.$refs.container.getBoundingClientRect();
        let scale = window.devicePixelRatio;
        let payload = {
          video: { media: this.media.id, id: this.slide.id },
          x: rect.left * scale,
          y: rect.top * scale,
          width: rect.width * scale,
          height: rect.height * scale,
          scale: 1,
          volume: this.slide.data.mute ? 0 : parseInt(this.slide.data.volume),
          looped: false,
          style: {},
        };
        window.$logger.log("Slides Essentials: Video: Ask to play floating video with payload: " + JSON.stringify(payload));
        $host.askToPlayFloatingVideo(payload);

        return;
      } else {
        this.player.currentTime = 0;
      }
    },
    _canPlayThrough() {
      window.$logger.log("Slides Essentials: Video: start playback (can play through event)");
      var promise = this.player.play();
      if (promise !== undefined) {
        promise.then(() => {
          window.$logger.log("Slides Essentials: Video: Playback confirmly started");
        }).catch(error => {
          window.$logger.log("Slides Essentials: Video: Playback rejected "+ error, false);
        });
      } else {
        window.$logger.log("Slides Essentials: Video: [Error] Cannot play for unknown reason")
      }
    },
    onWaiting() {
      window.$logger.log("Slides Essentials: Video: Waiting Event");
      if (!this.screenReloadTimeout) {
        this.screenReloadTimeout = setTimeout(() => {
          window.$logger.log("Slides Essentials: Video: Reload screen on waiting event video", false);
          window.location.reload(true);
        }, 7000);
      }
    },
    onPlaying() {
      // window.$logger.log("Slides Essentials: Video: Playing Event", true);
      if (this.screenReloadTimeout) {
        window.$logger.log("Slides Essentials: Video: Playback started while waiting, do not reload", false);
        clearTimeout(this.screenReloadTimeout);
        this.screenReloadTimeout = null;
      }
    },
    onPlayerError(err) {
      window.$logger.log("Slides Essentials: Video: Error Event");
      // window.$logger.log("Slides Essentials: Video: ERROR CODE: ");
      // window.$logger.log("Slides Essentials: Video: ERROR MESSAGE: ");
      this.loadAsset(this.media.id)
    },
    stopVideo() {
      window.$logger.log("Slides Essentials: Video: paused playback");
      this.player.pause()
    },
    togglePauseVideo(){
      if(this.player.paused){
        this.player.play();
      }
      else {
        this.player.pause();
      }
    },
    loadAsset(id) {
      if (!this.isUsingFloatingVideo) {
        window.$host.retrieveAsset(id).then(async (media) => {
          window.$logger.log("Slides Essentials: Video: Asset retrieved");
          window.$logger.log("Slides Essentials: Video: Setting blob url (not floating video)");
          this.media.cachedUrl = media.blob
          this.url = media.blob
          await this.setSubtitleUrl(id);
          instMediaManager.lastUseMediaUpdating(media.data.mediaId)
        }).catch((err) => {
          window.$logger.log("Slides Essentials: Video: Can\'t retrieve asset: " + err, false)
        });
      }
    },
    setVideoUrl(videoUrl) {
      if (this.isUsingFloatingVideo) {
        // if (!this.videoLoaded) {
        //     this.videoLoaded = true;
        this.startVideo();
        // }
        return;
      }
      this.videoLoaded = true;
      this.player.src = videoUrl;
      this.player.load();
      this.startVideo();
    },
    videoIsPlaying() {
      return this.player.currentTime > 0 && !this.player.paused && !this.player.ended
    },
    setSubtitleUrl(id) {
      return instDatabase.db_subtitles.getAttachment(id.toString() + '-' + this.slide.data.media.subtitle_lang, 'subtitle').then((subtitle) => {
        this.subtitle = URL.createObjectURL(subtitle);
      }).catch((err) => {
        window.$logger.log("No subtitles in database for this video !!")
        return null;
      })
    },
  },
  computed: {
    ...mapState(['data']),
    ...mapGetters({
      isZoningModeEnabled: 'isZoningModeEnabled',

    }),
    showBottomBar() {
      return !this.fullscreen && this.isZoningModeEnabled;
    },
    fullscreen() {
      return this.$store.getters.fullscreen;
    },
    videoStyle() {
      if (this.data.orientation === 0 || this.data.orientation === 180) {
        return { height: '100%' };
      }

      return { width: '100%' };
    },
    media() {
      return this.slide.data.media
    },
    model() {
      return this.$store.getters.model;
    },
    isUsingFloatingVideo() {
      return this.model === 'Samsung-SSSP' || this.model === 'Android';
    }
  }
}
</script>
