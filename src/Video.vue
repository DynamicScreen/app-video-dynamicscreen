<template>
  <div>
    <div class="slide-content" ref="container">
      <video ref="video" id="video" crossorigin="anonymous"
             v-show="videoLoaded"
             class="video-player"
             :src="url"
             :style="videoStyle"
      >
      </video>
    </div>
  </div>
</template>

<style scoped>

.slide-content {
  height: 100%;
  width: 100%;
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
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: 10;
}

</style>

<script>
import {defineComponent} from "vue";
import i18next from "i18next";
import en from "../languages/en.json";
import fr from "../languages/fr.json";

export default defineComponent({
  props: ['context'],
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
    this.initSlideVideo();
  },
  activated() {
    this.initSlideVideo();
  },
  deactivated() {
    this.player.pause();

    this.player.removeEventListener('canplaythrough', this._canPlayThrough);
    this.player.removeEventListener('ended', this.onEnded);
    this.player.removeEventListener('waiting', this.onWaiting);
    this.player.removeEventListener('playing', this.onPlaying);
  },
  beforeUnmount() {
    this.player.pause();
    this.player.src = '';
    this.player.load();
  },
  methods: {
    onEnded() {
      this._canPlayThrough();
    },
    initI18n() {
      i18next.init({
        fallbackLng: 'en',
        lng: 'fr',
        resources: {
          en: { translation: en },
          fr: { translation: fr },
        },
        debug: true,
        ns: {
          namespaces: ['translation'],
          defaultNs: 'translation'
        }
      }, (err, t) => {
        if (err) return console.log('something went wrong loading translations', err);
      });
    },
    initSlideVideo() {
      this.initPlayer();
      this.url = this.media.url
      this.setVideoUrl(this.url);
      this.initialized = true;
    },
    initPlayer() {
      this.player = this.$refs.video;
      this.player.addEventListener('canplaythrough', this._canPlayThrough);
      this.player.addEventListener('ended', this.onEnded);
      this.player.addEventListener('waiting', this.onWaiting);
      this.player.addEventListener('playing', this.onPlaying);

      this.player.preload = "auto";
      this.player.volume = parseInt(this.data.volume) / 100
      this.player.muted = this.data.mute === "1";
    },
    startVideo() {
      this.player.currentTime = 0;
    },
    _canPlayThrough() {
      this.player.play();
    },
    onWaiting() {
      if (!this.screenReloadTimeout) {
        this.screenReloadTimeout = setTimeout(() => {
          window.location.reload(true);
        }, 7000);
      }
    },
    onPlaying() {
      if (this.screenReloadTimeout) {
        clearTimeout(this.screenReloadTimeout);
        this.screenReloadTimeout = null;
      }
    },
    stopVideo() {
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
    setVideoUrl(videoUrl) {
      this.videoLoaded = true;
      this.player.src = videoUrl;
      this.player.load();
      this.startVideo();
    },
    videoIsPlaying() {
      return this.player.currentTime > 0 && !this.player.paused && !this.player.ended
    },
  },
  computed: {
    slide() {
      return this.context.slide;
    },
    data() {
      return this.context.slide.data;
    },
    media() {
      return this.data.media;
    },
    videoStyle() {
      if (this.data.orientation === 0 || this.data.orientation === 180) {
        return { height: '100%' };
      }

      return { width: '100%' };
    },
  }
});
</script>
