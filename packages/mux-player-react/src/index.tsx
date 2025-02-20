import React, { useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { StreamTypes } from '@mux/playback-core';
import { MediaError } from '@mux/mux-player';
import type MuxPlayerElement from '@mux/mux-player';
import type { Tokens } from '@mux/mux-player';
import { toNativeProps } from './common/utils';
import { useRef } from 'react';
import { useCombinedRefs } from './useCombinedRefs';
import useObjectPropEffect, { defaultHasChanged } from './useObjectPropEffect';
import { getPlayerVersion } from './env';

export { MediaError };

type ValueOf<T> = T[keyof T];

export type MuxPlayerRefAttributes = MuxPlayerElement;
type VideoApiAttributes = {
  currentTime: number;
  volume: number;
  paused: boolean;
  src: string | null;
  poster: string;
  playbackRate: number;
  playsInline: boolean;
  preload: string;
  crossOrigin: string;
  autoPlay: boolean | string;
  loop: boolean;
  muted: boolean;
  style: CSSProperties;
};

type MuxMediaPropTypes = {
  audio: boolean;
  // envKey: Options["data"]["env_key"];
  envKey: string;
  // debug: Options["debug"] & Hls["config"]["debug"];
  debug: boolean;
  // metadata: Partial<Options["data"]>;
  metadata: { [k: string]: any };
  beaconCollectionDomain: string;
  customDomain: string;
  playbackId: string;
  preferMse: boolean;
  streamType: ValueOf<StreamTypes> | 'vod';
  startTime: number;
  children: never[];
};

export type MuxPlayerProps = {
  className?: string;
  hotkeys?: string;
  nohotkeys?: boolean;
  defaultHiddenCaptions?: boolean;
  playerSoftwareVersion?: string;
  playerSoftwareName?: string;
  forwardSeekOffset?: number;
  backwardSeekOffset?: number;
  metadataVideoId?: string;
  metadataVideoTitle?: string;
  metadataViewerUserId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  playbackRates?: number[];
  defaultShowRemainingTime?: boolean;
  thumbnailTime?: number;
  title?: string;
  tokens?: Tokens;
  onAbort?: EventListener;
  onCanPlay?: EventListener;
  onCanPlayThrough?: EventListener;
  onEmptied?: EventListener;
  onLoadStart?: EventListener;
  onLoadedData?: EventListener;
  onLoadedMetadata?: EventListener;
  onProgress?: EventListener;
  onDurationChange?: EventListener;
  onVolumeChange?: EventListener;
  onRateChange?: EventListener;
  onResize?: EventListener;
  onWaiting?: EventListener;
  onPlay?: EventListener;
  onPlaying?: EventListener;
  onTimeUpdate?: EventListener;
  onPause?: EventListener;
  onSeeking?: EventListener;
  onSeeked?: EventListener;
  onStalled?: EventListener;
  onSuspend?: EventListener;
  onEnded?: EventListener;
  onError?: EventListener;
  onPlayerReady?: EventListener;
} & Partial<MuxMediaPropTypes> &
  Partial<VideoApiAttributes>;

const MuxPlayerInternal = React.forwardRef<MuxPlayerRefAttributes, MuxPlayerProps>(({ children, ...props }, ref) => {
  return React.createElement('mux-player', toNativeProps({ ...props, ref }), children);
});

const useEventCallbackEffect = (
  type: string,
  ref: // | ((instance: EventTarget | null) => void)
  React.MutableRefObject<EventTarget | null> | null | undefined,
  callback: EventListener | undefined
) => {
  return useEffect(() => {
    const eventTarget = ref?.current;
    if (!eventTarget || !callback) return;
    eventTarget.addEventListener(type, callback);
    return () => {
      eventTarget.removeEventListener(type, callback);
    };
  }, [ref?.current, callback]);
};

const usePlayer = (
  ref: // | ((instance: EventTarget | null) => void)
  React.MutableRefObject<MuxPlayerElement | null> | null | undefined,
  props: MuxPlayerProps
) => {
  const {
    onAbort,
    onCanPlay,
    onCanPlayThrough,
    onEmptied,
    onLoadStart,
    onLoadedData,
    onLoadedMetadata,
    onProgress,
    onDurationChange,
    onVolumeChange,
    onRateChange,
    onResize,
    onWaiting,
    onPlay,
    onPlaying,
    onTimeUpdate,
    onPause,
    onSeeking,
    onSeeked,
    onStalled,
    onSuspend,
    onEnded,
    onError,
    onPlayerReady,
    metadata,
    tokens,
    paused,
    playbackId,
    playbackRates,
    ...remainingProps
  } = props;
  useObjectPropEffect('playbackRates', playbackRates, ref);
  useObjectPropEffect('metadata', metadata, ref);
  useObjectPropEffect('tokens', tokens, ref);
  useObjectPropEffect('playbackId', playbackId, ref);
  useObjectPropEffect(
    'paused',
    paused,
    ref,
    (playerEl: HTMLMediaElement, pausedVal?: boolean) => {
      if (pausedVal == null) return;
      if (pausedVal) {
        playerEl.pause();
      } else {
        playerEl.play();
      }
    },
    (playerEl, value, propName) => {
      if (playerEl.hasAttribute('autoplay') && !playerEl.hasPlayed) {
        return false;
      }
      return defaultHasChanged(playerEl, value, propName);
    }
  );
  useEventCallbackEffect('abort', ref, onAbort);
  useEventCallbackEffect('canplay', ref, onCanPlay);
  useEventCallbackEffect('canplaythrough', ref, onCanPlayThrough);
  useEventCallbackEffect('emptied', ref, onEmptied);
  useEventCallbackEffect('loadstart', ref, onLoadStart);
  useEventCallbackEffect('loadeddata', ref, onLoadedData);
  useEventCallbackEffect('loadedmetadata', ref, onLoadedMetadata);
  useEventCallbackEffect('progress', ref, onProgress);
  useEventCallbackEffect('durationchange', ref, onDurationChange);
  useEventCallbackEffect('volumechange', ref, onVolumeChange);
  useEventCallbackEffect('ratechange', ref, onRateChange);
  useEventCallbackEffect('resize', ref, onResize);
  useEventCallbackEffect('waiting', ref, onWaiting);
  useEventCallbackEffect('play', ref, onPlay);
  useEventCallbackEffect('playing', ref, onPlaying);
  useEventCallbackEffect('timeupdate', ref, onTimeUpdate);
  useEventCallbackEffect('pause', ref, onPause);
  useEventCallbackEffect('seeking', ref, onSeeking);
  useEventCallbackEffect('seeked', ref, onSeeked);
  useEventCallbackEffect('stalled', ref, onStalled);
  useEventCallbackEffect('suspend', ref, onSuspend);
  useEventCallbackEffect('ended', ref, onEnded);
  useEventCallbackEffect('error', ref, onError);
  useEventCallbackEffect('playerready', ref, onPlayerReady);
  return [remainingProps];
};

const playerSoftwareVersion = getPlayerVersion();
const playerSoftwareName = 'mux-player-react';

const MuxPlayer = React.forwardRef<
  MuxPlayerRefAttributes,
  Omit<MuxPlayerProps, 'playerSoftwareVersion' | 'playerSoftwareName'>
>((props, ref) => {
  const {
    /** @TODO Remove these once defaults are added to mux-player (CJP) */
    forwardSeekOffset = 10,
    backwardSeekOffset = 10,
  } = props;

  const innerPlayerRef = useRef<MuxPlayerElement>(null);
  const playerRef = useCombinedRefs(innerPlayerRef, ref);
  const [remainingProps] = usePlayer(innerPlayerRef, props);

  return (
    <MuxPlayerInternal
      /** @TODO Fix types relationships (CJP) */
      ref={playerRef as typeof innerPlayerRef}
      playerSoftwareName={playerSoftwareName}
      playerSoftwareVersion={playerSoftwareVersion}
      forwardSeekOffset={forwardSeekOffset}
      backwardSeekOffset={backwardSeekOffset}
      {...remainingProps}
    />
  );
});

export default MuxPlayer;
