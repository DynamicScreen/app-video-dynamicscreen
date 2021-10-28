import {
  BaseContext,
  AssetDownload,
  IAssetsStorageAbility,
  IGuardsManager,
  ISlideContext,
  IPublicSlide,
  SlideModule
} from "dynamicscreen-sdk-js";

import i18next from "i18next";

const en = require("../../languages/en.json");
const fr = require("../../languages/fr.json");

export default class VideoSlideModule extends SlideModule {
  constructor(context: ISlideContext) {
    super(context);
  }

  trans(key: string) {
    return i18next.t(key);
  };

  async onReady() {
    console.log('Video working to be ready...')

    // const guard = this.context.guardManager.add('ready', this.context.slide.id);
    await this.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
      await ability.download(this.context.slide.data.url, (assetDownload: AssetDownload) => {
        assetDownload.onProgress.subscribe((progress, ev) => {
          console.log('progress: ',  progress);
          ev.unsub();
        });

        assetDownload.onCompleted.subscribe((asset, ev) => {
          console.log('media: ', asset);
          ev.unsub();
        });
      });
    });

    console.log('Video IS ready...')

    // guard.remove();
    return true;
  };

  onMounted() {
    console.log('VIDEO: onMounted')
  }

  onUpdated() {
    console.log('VIDEO: onUpdated')
  }

  initPlayer() {
    // const toto = document.getElementById('video');
    // console.log('element video player', toto)

    // this.player.value = toto
    // player.addEventListener('canplaythrough', _canPlayThrough);
    // player.addEventListener('ended', onEnded);
    // player.addEventListener('waiting', onWaiting);
    // player.addEventListener('playing', onPlaying);

    // player.preload = "auto";
    // player.volume = parseInt(slide.data.volume) / 100
    // player.muted = slide.data.mute === "1";
  };

  initI18n() {
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

  // @ts-ignore
  setup(props, ctx) {
    const { h, ref, reactive, computed} = ctx;
    let slide = reactive(props.slide) as IPublicSlide;
    const context = reactive(props.slide.context) as ISlideContext;
    const url = ref("");

    this.context = context

    context.onPrepare(async () => {
      await context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
        this.initI18n();
        this.initPlayer();
        url.value = await ability.getDisplayableAsset(slide.data.media.url).then((asset) => asset.displayableUrl());
      });
    });

    const videoStyle = computed(() => {
      if (slide.data.orientation === 0 || slide.data.orientation === 180) {
        return [{ height: '100%' }];
      }

      return [{ width: '100%' }];
    });

    context.onReplay(async () => {
      console.log('VIDEO: onReplay')

      //@ts-ignore
      document.getElementById('video').play();
    });

    context.onPlay(async () => {
      console.log('VIDEO: onPlay', url.value)

      //@ts-ignore
      document.getElementById('video').play();
    });

    // context.onPause(async () => {
    //   console.log('VIDEO: onPause')
    // });

    context.onEnded(async () => {
      console.log('VIDEO: onEnded')

      //@ts-ignore
      document.getElementById('video').play();
    });

    return () => h("div", {
      class: "container"
    }, [
      h("div", {
        class: "flex items-center justify-center w-full h-full bg-black"
      }, [
        h("video", {
          id: "video",
          class: "video-player h-full",
          src: url.value,
          style: videoStyle,
        }),
      ]),
    ])
  }
}
