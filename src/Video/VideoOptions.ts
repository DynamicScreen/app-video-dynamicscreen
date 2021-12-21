import {
  ISlideContext,
  ISlideOptionsContext,
  SlideOptionsModule,
  VueInstance,
} from "dynamicscreen-sdk-js";

export default class VideoOptionsModule extends SlideOptionsModule {
  constructor(context: ISlideOptionsContext) {
    super(context);
  }

  async onReady() {
    return true;
  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideOptionsContext) {
    const { h } = vue;

    const update = context.update;
    const { Field, FieldsRow, Toggle, NumberInput, MediaPicker } = this.context.components

    return () => [
      h(Field, { label: this.t('modules.video.options.media-picker.label') }, [
        h(MediaPicker, { type: 'video', ...update.option("video-medias") })
      ]),
      h(FieldsRow, {}, [
        h(Toggle, { class: 'flex-1', ...update.option("mute") }, this.t('modules.video.options.mute')),
        h(Field, { class: 'flex-1', label: this.t('modules.video.options.volume') }, [
          h(NumberInput, { min: 0, max: 100, default: 50, ...update.option("volume") })
        ])
      ])
    ];
  }
}
