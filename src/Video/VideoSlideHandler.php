<?php

namespace DynamicScreen\Video\Video;

use DynamicScreen\SdkPhp\Handlers\SlideHandler;
use DynamicScreen\SdkPhp\Interfaces\ISlide;
use Illuminate\Support\Arr;

class VideoSlideHandler extends SlideHandler
{

    public function fetch(ISlide $slide): void
    {
        $mediaAccessKey = $this->needed_medias();

        if (is_array($mediaAccessKey)) {
            $mediaAccessKey = Arr::first($mediaAccessKey);
        }

        $medias = $slide->getMedia($mediaAccessKey);

        collect($medias)->each(function ($media) use ($slide) {
            $this->addSlide([
                'url' => Arr::get($media, 'url'),
                'media_id' => Arr::get($media, 'id'),
                'expired_at' => Arr::get($media,  'expired_at'),
                'volume' => $slide->getOption('volume', 50),
                'mute' => $slide->getOption('mute', false),
            ]);
        });
    }
}
