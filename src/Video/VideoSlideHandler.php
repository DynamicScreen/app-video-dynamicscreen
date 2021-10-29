<?php

namespace DynamicScreen\Video\Video;

use App\Domain\Module\Model\Module;
use DynamicScreen\SdkPhp\Handlers\SlideHandler;
use DynamicScreen\SdkPhp\Interfaces\ISlide;
use Illuminate\Support\Arr;

class VideoSlideHandler extends SlideHandler
{
    public function __construct(Module $module)
    {
        parent::__construct($module);
    }

    public function fetch(ISlide $slide): array
    {
        $mediaAccessKey = $this->needed_medias();

        if (is_array($mediaAccessKey)) {
            $mediaAccessKey = Arr::first($mediaAccessKey);
        }

        $medias = collect($slide->getMedias([$mediaAccessKey]));

        if ($medias->isEmpty()) {
            return [];
        }

        return collect($medias)->map(function ($media) use ($slide) {
            return [
                'media' => $media,
                'size' => Arr::get($media, 'size'),
                'url' => Arr::get($media, 'url'),
                'hash' => Arr::get($media, 'hash'),
                'media_id' => Arr::get($media, 'id'),
                'volume' => $slide->getOption('volume', 50),
                'mute' => $slide->getOption('mute', false),
            ];
        })->toArray();
    }

    public function needed_medias()
    {
        return $this->module->getOption('privileges.needs_media', false);
    }

    public function getDefaultOptions(): array
    {
        return [
            'title' => '',
            'message' => '',
            'backgroundColor' => '#D42500',
        ];
    }
}
