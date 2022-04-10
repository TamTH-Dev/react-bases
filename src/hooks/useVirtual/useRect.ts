import { RefObject, useEffect, useReducer, useRef, useState } from 'react'
import observeRect from '@reach/observe-rect'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'
import { IVirtualRect } from '../../types'

function rectReducer(state: IVirtualRect, action: { rect: IVirtualRect }) {
  const rect = action.rect

  if (state.height !== rect.height || state.width !== rect.width) {
    return rect
  }

  return state
}

export default function useRect(
  nodeRef: RefObject<HTMLElement>,
  initialRect: { width: number; height: number } = { width: 0, height: 0 }
) {
  const [element, setElement] = useState<HTMLElement | null>(nodeRef.current)
  const [rect, dispatch] = useReducer(rectReducer, initialRect)
  const initialRectSet = useRef(false)

  useIsomorphicLayoutEffect(() => {
    if (nodeRef.current !== element) {
      setElement(nodeRef.current)
    }
  })


  useIsomorphicLayoutEffect(() => {
    if (element && !initialRectSet.current) {
      initialRectSet.current = true
      const rect = element.getBoundingClientRect()
      dispatch({ rect })
    }
  }, [element])

  useEffect(() => {
    if (!element) return

    const observer = observeRect(element, rect => {
      dispatch({ rect })
    })

    observer.observe()

    return () => {
      observer.unobserve()
    }
  }, [element])

  return rect
}
