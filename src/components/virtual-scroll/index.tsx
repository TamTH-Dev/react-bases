import { memo, UIEvent, useState } from 'react'
import { IData } from '../../types'
import styles from './style.module.scss'

interface IProps {
  data: IData[]
}

const CONTAINER_HEIGHT = 500
const ROW_HEIGHT = 30
const LIMIT = 15

function VirtualScroll({ data }: IProps) {
  const [scrollTop, setScrollTop] = useState<number>(0)
  const startNode = Math.ceil(scrollTop / ROW_HEIGHT)
  const visibleData = data.slice(startNode, startNode + LIMIT)
  const startRowHeight = scrollTop
  const endRowHeight =
    data.length * ROW_HEIGHT - startRowHeight - CONTAINER_HEIGHT

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>You've scrolled: {scrollTop}</div>
      <div
        onScroll={handleScroll}
        style={{ height: CONTAINER_HEIGHT }}
        className={styles['container']}
      >
        <table className={styles['table']}>
          <tbody>
            <tr style={{ height: startRowHeight }}></tr>
            {visibleData.map(d => (
              <tr style={{ height: ROW_HEIGHT }} key={d.id}>
                <td>{d.id + 1}</td>
                <td>{d.col1}</td>
                <td>{d.col2}</td>
                <td>{d.col3}</td>
                <td>{d.col4}</td>
                <td>{d.col5}</td>
              </tr>
            ))}
            <tr style={{ height: endRowHeight }}></tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

export default memo(VirtualScroll)
