<template>
  <div>
    <div class="slide-content" ref="container">
      <video ref="video" id="video" crossorigin="anonymous"
             class="video-player"
             :src="url"
      >
      </video>
    </div>
  </div>
</template>

<script>

import {defineComponent} from "vue";
import i18next from "i18next";
import en from "../../app-video/languages/en.json";
import fr from "../../app-video/languages/fr.json";

export default defineComponent({
  name: "Video",
  props: ['context'],
  data() {
    return {
      url: null,
    }
  },
  mounted() {
    this.initSlideVideo();
    // this.initialized = true;
    this.initI18n();
  },
  activated() {
    this.initSlideVideo();
  },
  methods: {
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
      this.url = this.media.url
    },
  }
}
</script>

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

