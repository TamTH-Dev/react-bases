import { useCallback, useMemo, useRef, useState } from 'react'

import { IVirtualItem, IVirtualProps, IVirtualRange } from '../../types'

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'
import useRect from './useRect'

export function useVirtual({
  estimateSize = defaultEstimateSize,
  horizontal = false,
  initialRect,
  keyExtractor = defaultKeyExtractor,
  measureSize = defaultMeasureSize,
  onScrollElement,
  overscan = 1,
  paddingStart = 0,
  paddingEnd = 0,
  parentRef,
  rangeExtractor = defaultRangeExtractor,
  scrollOffsetFn,
  scrollToFn,
  size,
  useObserver,
}: IVirtualProps<any>) {
  const sizeKey = horizontal ? 'width' : 'height'
  const scrollKey = horizontal ? 'scrollLeft' : 'scrollTop'

  const lastestRef = useRef<{
    scrollOffset: number
    measurements: IVirtualItem[]
    outerSize: number
    totalSize: number
  }>({
    scrollOffset: 0,
    measurements: [],
    outerSize: 0,
    totalSize: 0,
  })

  const [scrollOffset, setScrollOffset] = useState(0)
  lastestRef.current.scrollOffset = scrollOffset

  const useMeasureParent = useObserver || useRect

  const { [sizeKey]: outerSize } = useMeasureParent(parentRef, initialRect)

  lastestRef.current.outerSize = outerSize

  const defaultScrollToFn = useCallback(
    offset => {
      if (parentRef.current) {
        parentRef.current[scrollKey] = offset
      }
    },
    [parentRef, scrollKey]
  )

  const resolvedScrollToFn = scrollToFn || defaultScrollToFn

  scrollToFn = useCallback(
    offset => {
      resolvedScrollToFn(offset, defaultScrollToFn)
    },
    [defaultScrollToFn, resolvedScrollToFn]
  )

  const pendingMeasuredCacheIndexesRef = useRef<number[]>([])

  const measurements = useMemo(() => {
    const min =
      pendingMeasuredCacheIndexesRef.current.length > 0
        ? Math.min(...pendingMeasuredCacheIndexesRef.current)
        : 0

    pendingMeasuredCacheIndexesRef.current = []

    const measurements = lastestRef.current.measurements.slice(0, min)

    for (let i = min; i < size; i++) {
      const key = keyExtractor(i)
      const start = measurements[i - 1] ? measurements[i - 1].end : paddingStart
      const size = estimateSize(i)
      const end = start + size
      measurements[i] = { index: i, start, size, end, key }
    }

    return measurements
  }, [estimateSize, paddingStart, size, keyExtractor])

  const totalSize = (measurements[size - 1]?.end || paddingStart) + paddingEnd

  lastestRef.current.measurements = measurements
  lastestRef.current.totalSize = totalSize

  const element = onScrollElement ? onScrollElement.current : parentRef.current

  const scrollOffsetFnRef = useRef(scrollOffsetFn)
  scrollOffsetFnRef.current = scrollOffsetFn

  useIsomorphicLayoutEffect(() => {
    if (!element) {
      setScrollOffset(0)

      return
    }

    const onScroll = (event?: Event) => {
      const offset = scrollOffsetFnRef.current
        ? scrollOffsetFnRef.current(event)
        : element[scrollKey]

      setScrollOffset(offset)
    }

    onScroll()

    element.addEventListener('scroll', onScroll, {
      capture: false,
      passive: true,
    })

    return () => {
      element.removeEventListener('scroll', onScroll)
    }
  }, [element, scrollKey])

  const { start, end } = calculateRange(lastestRef.current)

  const indexes = useMemo(
    () =>
      rangeExtractor({
        start,
        end,
        size: measurements.length,
        overscan,
      }),
    [start, end, measurements.length, overscan]
  )

  const measureSizeRef = useRef(measureSize)
  measureSizeRef.current = measureSize

  const virtualItems = useMemo(() => {
    const virtualItems: IVirtualItem[] = []

    for (let k = 0, len = indexes.length; k < len; k++) {
      const i = indexes[k]
      const measurement = measurements[i]

      const item = {
        ...measurement,
      }

      virtualItems.push(item)
    }

    return virtualItems
  }, [indexes, defaultScrollToFn, horizontal, measurements])

  return {
    virtualItems,
    totalSize,
  }
}

function defaultEstimateSize() {
  return 50
}

function defaultKeyExtractor(index: number) {
  return index
}

function defaultMeasureSize(
  el: { offsetWidth: number; offsetHeight: number },
  horizontal: boolean
) {
  const key = horizontal ? 'offsetWidth' : 'offsetHeight'

  return el[key]
}

function defaultRangeExtractor(range: IVirtualRange) {
  const start = Math.max(range.start - range.overscan, 0)
  const end = Math.min(range.end + range.overscan, range.size - 1)

  const arr = []

  for (let i = start; i <= end; i++) {
    arr.push(i)
  }

  return arr
}

function calculateRange({
  measurements,
  outerSize,
  scrollOffset,
}: {
  measurements: IVirtualItem[]
  outerSize: number
  scrollOffset: number
}) {
  const size = measurements.length - 1
  const getOffset = (index: number) => measurements[index].start

  let start = findNearestBinarySearch(0, size, getOffset, scrollOffset)
  let end = start

  while (end < size && measurements[end].end < scrollOffset + outerSize) {
    end++
  }

  return { start, end }
}

function findNearestBinarySearch(
  low: number,
  high: number,
  getCurrentValue: (value: number) => number,
  value: number
) {
  while (low <= high) {
    const middle = ((low + high) / 2) | 0
    const currentValue = getCurrentValue(middle)

    if (currentValue < value) {
      low = middle + 1
    } else if (currentValue > value) {
      high = middle - 1
    } else {
      return middle
    }
  }

  if (low > 0) {
    return low - 1
  }

  return 0
}
