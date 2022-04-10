import { RefObject } from 'react'

type Key = number | string

export interface IVirtualRect {
  width: number
  height: number
}

export interface IVirtualProps<T> {
  size: number
  parentRef: RefObject<T>
  estimateSize?: (index: number) => number
  overscan?: number
  horizontal?: boolean
  measureSize?: (
    el: { offsetWidth: number; offsetHeight: number },
    horizontal: boolean
  ) => number
  scrollToFn?: (
    offset: number,
    defaultScrollToFn?: (offset: number) => void
  ) => void
  paddingStart?: number
  paddingEnd?: number
  useObserver?: (ref: RefObject<T>, initialRect?: IVirtualRect) => IVirtualRect
  initialRect?: IVirtualRect
  keyExtractor?: (index: number) => Key
  onScrollElement?: RefObject<HTMLElement>
  scrollOffsetFn?: (event?: Event) => number
  rangeExtractor?: (range: IVirtualRange) => number[]
}

export interface IVirtualRange {
  start: number
  end: number
  overscan: number
  size: number
}

export interface IVirtualItem {
  key: Key
  index: number
  start: number
  end: number
  size: number
  measureRef?: (el: HTMLElement | null) => void
}
