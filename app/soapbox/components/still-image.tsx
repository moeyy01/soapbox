import clsx from 'clsx';
import React, { useRef } from 'react';

import { useSettings } from 'soapbox/hooks';

import ExtensionBadge from './extension-badge';

interface IStillImage {
  /** Image alt text. */
  alt?: string,
  /** Extra class names for the outer <div> container. */
  className?: string,
  /** URL to the image */
  src: string,
  /** Extra CSS styles on the outer <div> element. */
  style?: React.CSSProperties,
  /** Whether to display the image contained vs filled in its container. */
  letterboxed?: boolean,
  /** Whether to show the file extension in the corner. */
  showExt?: boolean,
}

/** Renders images on a canvas, only playing GIFs if autoPlayGif is enabled. */
const StillImage: React.FC<IStillImage> = ({ alt, className, src, style, letterboxed = false, showExt = false }) => {
  const settings = useSettings();
  const autoPlayGif = settings.get('autoPlayGif');

  const canvas = useRef<HTMLCanvasElement>(null);
  const img    = useRef<HTMLImageElement>(null);

  const hoverToPlay = (
    src && !autoPlayGif && (src.endsWith('.gif') || src.startsWith('blob:'))
  );

  const handleImageLoad = () => {
    if (hoverToPlay && canvas.current && img.current) {
      canvas.current.width  = img.current.naturalWidth;
      canvas.current.height = img.current.naturalHeight;
      canvas.current.getContext('2d')?.drawImage(img.current, 0, 0);
    }
  };

  /** ClassNames shared between the `<img>` and `<canvas>` elements. */
  const baseClassName = clsx('block h-full w-full', {
    'object-contain': letterboxed,
    'object-cover': !letterboxed,
  });

  return (
    <div
      data-testid='still-image-container'
      className={clsx(className, 'group relative isolate overflow-hidden')}
      style={style}
    >
      <img
        src={src}
        alt={alt}
        ref={img}
        onLoad={handleImageLoad}
        className={clsx(baseClassName, {
          'invisible group-hover:visible': hoverToPlay,
        })}
      />

      {hoverToPlay && (
        <canvas
          ref={canvas}
          className={clsx(baseClassName, {
            'group-hover:invisible': hoverToPlay,
          })}
        />
      )}

      {(hoverToPlay && showExt) && (
        <div className='pointer-events-none absolute left-2 bottom-2 opacity-90 group-hover:hidden'>
          <ExtensionBadge ext='GIF' />
        </div>
      )}
    </div>
  );
};

export default StillImage;
