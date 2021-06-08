<?php

namespace Vendor\MyApp;


use DynamicScreen\SdkPhp\Slide\SlideHandler;
use DynamicScreen\SdkPhp\Slide\ISlide;

class Video extends SlideHandler {

    public function fetch(ISlide $slide): array
    {
        return [
            'title' => $slide->getOption('title'),
            'message' => $slide->getOption('message'),
            'backgroundColor' => $slide->getOption('backgroundColor'),
        ];
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
