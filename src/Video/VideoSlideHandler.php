<?php

namespace DynamicScreen\Video\Video;

use App\Rules\AreAvailable;
use DynamicScreen\ExtensionKit\SlideContract;
use DynamicScreen\SdkPhp\Handlers\SlideHandler;
use DynamicScreen\SdkPhp\Interfaces\ISlide;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;

class VideoSlidehandler extends SlideHandler {

    public function fetch(ISlide $slide): array
    {
        $subtitle = null;
        $options = $slide->getOptions();

//        if (isset($options['media'])) {
//            \App\Models\Media::where('id', $options['media'])->each(function ($media) use ($slide, $subtitle, $options) {
//                if (!$media->isExpired) {
//                    if ($slide->getOption('subtitle', 0)) {
//                        $subtitle = $this->getSubtitleToUse($slide, $options['media']);
//                        $media->subtitle_url = $subtitle ? $subtitle->url : null;
//                        $media->subtitle_lang = $subtitle ? $subtitle->lang : null;
//                    }
//                    if (!$media->metadata('transcoded', true)) {
//                        return;
//                    }
//                    $this->slide([
//                        'media' => $media,
//                        'size' => $media->size,
//                        'url' => $media->url,
//                        'hash' => $media->hash,
//                        'media_id' => $media->id,
//                        'volume' => $slide->getOption('volume', 50),
//                        'mute' => $slide->getOption('mute', false),
//                    ]);
//                }
//            });
//        } elseif (isset($options['video'])) {
//            $this->slide([
//                'url' => $this->getExtension()->getUploadedFileUrl($options['video'], 'videos'),
//                'hash' => $options['hash']
//            ]);
//        }

        return $options;
    }

    public function processOptions($options)
    {
        /** @var Request $request */
        $request = app('request');

        if (Arr::has($options, 'remoteFiles')) {
            $options['remoteFiles'] = [Arr::get($options, 'remoteFiles.0')];
            return $options;
        }

        if ($request->has('media')) {
            $options['media'] = $request->get('media');
            return $options;
        }

        if ($request->hasFile('options.video')) {
            /** @var UploadedFile $video */
            $video = app('request')->file('options.video');
//            $options['duration'] = $this->getVideoDuration($video->path());
//            $options['video'] = $this->getExtension()->uploadFile('video', 'videos');
//            $options['hash'] = $this->generateHash($video->path());
            return $options;
        }
        return $options;
    }

    public function getValidations(Request $request = null)
    {
        $media_rules = ['required_if:options.type,media'];

        $options = $request->get('options');
//        if ($request && Arr::get($options, 'type') === 'media') {
//            $media_rules[] = new AreAvailable;
//        }

        return [
            'rules' => [
                'media'          => $media_rules,
                'remote_file_id' => 'required_if:options.type,drive',
            ],
            'messages' => [
                'media.required_if' => __('dynamicscreen.slides-essentials::video.validations.media_required'),
            ],
        ];
    }

    public function getAttachedMedias(ISlide $slide)
    {
        $media = $slide->getOption('media');
        return $media === null ? [] : [$media];
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
