import { useRef } from 'react'
// import { VIRTUAL_SCROLL_DATA } from '../../constants'
import { useVirtual } from '../../hooks'
import styles from './style.module.scss'

function VirtualComponent() {
  const parentRef = useRef(null)

  const rowVirtualizer = useVirtual({
    size: 1000000,
    parentRef,
    overscan: 1,
  })

  return (
    <div ref={parentRef} className={styles['container']}>
      <div
        style={{ height: rowVirtualizer.totalSize }}
        className={styles['data-wrapper']}
      >
        {rowVirtualizer.virtualItems.map(virtualRow => (
          <div
            className={
              virtualRow.index % 2 === 0
                ? styles['even-row']
                : styles['odd-row']
            }
            style={{
              width: '100%',
              height: `${virtualRow.size}px`,
              position: 'absolute',
              transform: `translateY(${virtualRow.start}px)`,
            }}
            key={virtualRow.index}
          >
            Row {virtualRow.index}
          </div>
        ))}
      </div>
    </div>
  )
}

export default VirtualComponent
