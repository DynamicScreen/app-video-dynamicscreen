<template>
  <div class="slide-content">
    <video id="video" crossorigin="anonymous"
           class="video-player"
           :src="url"
           :style="videoStyle"
    >
    </video>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, computed, onMounted, PropType, reactive, Ref} from "vue";
import i18next from "i18next";
import {ISlideContext, ISlide, AssetDownload, Asset, SlideModule, IAssetsStorageAbility} from "dynamicscreen-sdk-js";
const en = require("../../languages/en.json");
const fr = require("../../languages/fr.json");

export default defineComponent({
  name: "Image",
  props: { context: {type: Object as PropType<ISlideContext>, required: true} },
  setup(props, ctx) {
    let slide = reactive(props.context.slide) as ISlide;
    let url = ref("");
    let player = ref() as Ref<HTMLElement | null>;

    onMounted(async () => {
      await props.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
        initI18n();
        initPlayer();
        url = await ability.getDisplayableAsset(props.context.slide.data.url).then()
      });
    })

    const initPlayer = () => {
      player.value = document.getElementById('video');
      // player.addEventListener('canplaythrough', _canPlayThrough);
      // player.addEventListener('ended', onEnded);
      // player.addEventListener('waiting', onWaiting);
      // player.addEventListener('playing', onPlaying);

      // player.preload = "auto";
      // player.volume = parseInt(slide.data.volume) / 100
      // player.muted = slide.data.mute === "1";
    };

    const videoStyle = computed(() => {
      if (slide.data.orientation === 0 || slide.data.orientation === 180) {
        return { height: '100%' };
      }

      return { width: '100%' };
    });

    const trans = (key: string) => {
      return i18next.t(key);
    };

    const initI18n = () => {
      i18next.init({
        fallbackLng: 'en',
        lng: 'fr',
        resources: {
          en: { translation: en },
          fr: { translation: fr },
        },
        debug: true,
      }, (err, t) => {
        if (err) return console.log('something went wrong loading translations', err);
      });
    };

    return {
      trans, slide, url, videoStyle
    };
  }
});
</script>

<style>

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
