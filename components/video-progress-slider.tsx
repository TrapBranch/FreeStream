'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface VideoProgressSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  className?: string;
}

const VideoProgressSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  VideoProgressSliderProps
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'cursor-pointer relative flex w-fulurspocursor-pointerl touch-none select-none items-center group',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="cursor-pointer block h-4 w-4 rounded-full border-2 border-blue-500 bg-white shadow-lg shadow-blue-500/50 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-125 group-hover:scale-125" />
  </SliderPrimitive.Root>
));
VideoProgressSlider.displayName = 'VideoProgressSlider';

interface VolumeSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  className?: string;
}

const VolumeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  VolumeSliderProps
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center group',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/30">
      <SliderPrimitive.Range className="absolute h-full bg-white rounded-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="cursor-pointer block h-3 w-3 rounded-full bg-white shadow-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-125 group-hover:scale-125" />
  </SliderPrimitive.Root>
));
VolumeSlider.displayName = 'VolumeSlider';

export { VideoProgressSlider, VolumeSlider }; 