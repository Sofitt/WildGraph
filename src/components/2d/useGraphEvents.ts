import { useEffect } from 'react'

export function useGraphEvents(updateGraph: () => void) {
  useEffect(() => {
    // Добавление кнопки создания узла
    const addNodeBtn = document.getElementById('addNodeBtn')
    const handleAddNodeClick = () => {
      updateGraph()
    }

    if (addNodeBtn) {
      addNodeBtn.addEventListener('click', handleAddNodeClick)
    }

    // Слушатель события обновления графа
    window.addEventListener('updateGraph', updateGraph)

    return () => {
      if (addNodeBtn) {
        addNodeBtn.removeEventListener('click', handleAddNodeClick)
      }
      window.removeEventListener('updateGraph', updateGraph)
    }
  }, [updateGraph])
}
