import type { DetailedHTMLProps, HTMLAttributes, CSSProperties } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        src?: string
        alt?: string
        'camera-controls'?: boolean | string
        'auto-rotate'?: boolean | string
        'disable-zoom'?: boolean | string
        'shadow-intensity'?: string
        style?: CSSProperties
      }, HTMLElement>
    }
  }
}
