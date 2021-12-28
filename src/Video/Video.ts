import {
  ISlideContext,
  IPublicSlide,
  IAssetsStorageAbility,
  IAssetDownload,
  SlideModule,
  VueInstance,
  IVideoPlaybackAbility,
  IVideoPlayer
} from "dynamicscreen-sdk-js";

export default class VideoSlideModule extends SlideModule {
  protected player: IVideoPlayer | null = null;

  async onReady() {
    // const guard = this.context.guardManager.add('ready', this.context.slide.id);
    await this.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
      await ability.download(this.context.slide.data.url, (assetDownload: IAssetDownload) => {
        assetDownload.onProgress.subscribe((progress, ev) => {
          ev.unsub();
        });

        assetDownload.onCompleted.subscribe((asset, ev) => {
          ev.unsub();
        });
      });
    });

    const playerExists = !!this.player;
    //add guard if player !exists (when they are working :p)
    if (!playerExists) {
      // const guard = this.context.guardManager.add('ready', this.context.slide.id);
    }

    return true;
    // return playerExists;
  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideContext) {
    const { h, ref, reactive, computed} = vue;
    let slide = reactive(this.context.slide) as IPublicSlide;
    const volume = computed<number>(() => this.context.slide.data.mute ? 0 : this.context.slide.data.volume);
    const url = ref("");

    this.context.onPrepare(async () => {
      console.log('IN onPrepare callback (video)')
      await this.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
        url.value = await ability.downloadAndGet(slide.data.url).then((asset) => asset.displayableUrl());
      });

      await this.context.videoPlayback().then(async (ability: IVideoPlaybackAbility) => {
        this.player = await ability.createVideoPlayer(url.value);
        this.player.setBoundaries(document.getElementById('video-player'))
        await this.player.prepare();
        slide.setDuration(this.player.getDuration());
        this.player.setVolume(volume.value)

        this.player.onEnded.sub(() => {
          this.player?.stop();
        });
        
      }).catch((err) => console.log('ability error: ', err));
    });

    this.context.onReplay(async () => {
      console.log('GOLEM (video): onReplay')
      await this.player?.play();
    });

    this.context.onPlay(async () => {
      console.log('GOLEM (video): onPlay callback', url.value)
      const a = await this.player?.play();
      //console.log('player is played now: ', a)
    });

    this.context.onResume(async () => {
      console.log('GOLEM (video): onResume callback')
      await this.player?.play();
    });

    this.context.onPause(async () => {
      console.log('GOLEM (video): onPause callback')
      await this.player?.pause();
    });

    this.context.onEnded(async () => {
      console.log('GOLEM (video): onEnded callback')
      await this.player?.stop();
    });

    return () => h("div", {
      class: "container"
    }, [
      h("div", {
        class: "flex items-center justify-center w-full h-full bg-black"
      }, [
        h("div", {
          id: "video-player",
          style: { width: '100%', height: '100%' },
        }),
      ]),
    ])
  }
}
