import {
  ISlideContext,
  IPublicSlide,
  IAssetsStorageAbility,
  IAssetDownload,
  SlideModule, VueInstance
} from "dynamicscreen-sdk-js";

export default class VideoSlideModule extends SlideModule {
  constructor(context: ISlideContext) {
    super(context);
  }

  async onReady() {
    console.log('Video working to be ready...')

    // const guard = this.context.guardManager.add('ready', this.context.slide.id);
    await this.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
      await ability.download(this.context.slide.data.url, (assetDownload: IAssetDownload) => {
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

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideContext) {
    const { h, ref, reactive, computed} = vue;
    let slide = reactive(this.context.slide) as IPublicSlide;
    const url = ref("");

    this.context.onPrepare(async () => {
      await this.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
        url.value = await ability.getDisplayableAsset(slide.data.url).then((asset) => asset.displayableUrl());
      });
    });

    const videoStyle = computed(() => {
      if (slide.data.orientation === 0 || slide.data.orientation === 180) {
        return [{ height: '100%' }];
      }

      return [{ width: '100%' }];
    });

    this.context.onReplay(async () => {
      console.log('VIDEO: onReplay')

      //@ts-ignore
      document.getElementById('video').play();
    });

    this.context.onPlay(async () => {
      console.log('VIDEO: onPlay', url.value)

      //@ts-ignore
      document.getElementById('video').play();
    });

    // context.onPause(async () => {
    //   console.log('VIDEO: onPause')
    // });

    this.context.onEnded(async () => {
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
