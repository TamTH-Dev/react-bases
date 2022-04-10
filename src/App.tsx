import { VirtualComponent } from './test'
import styles from './style.module.scss'

function App() {
  return (
    <div className={styles['container']}>
      <VirtualComponent />
    </div>
  )
}

export default App
