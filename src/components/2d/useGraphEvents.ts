import { useEffect } from 'react'

export function useGraphEvents(updateGraph: () => void, saveToFile: () => void) {
  useEffect(() => {
    // Добавление кнопки создания узла
    const addNodeBtn = document.getElementById('addNodeBtn')
    const saveToFileBtn = document.getElementById('saveToFileBtn')
    const handleAddNodeClick = () => {
      updateGraph()
    }
    const handleSaveFile = () => {
      saveToFile()
    }

    if (addNodeBtn) {
      addNodeBtn.addEventListener('click', handleAddNodeClick)
    }
    if (saveToFileBtn) {
      saveToFileBtn.addEventListener('click', handleSaveFile)
    }

    // Слушатель события обновления графа
    window.addEventListener('updateGraph', updateGraph)

    return () => {
      if (addNodeBtn) {
        addNodeBtn.removeEventListener('click', handleAddNodeClick)
      }
      if (saveToFileBtn) {
        saveToFileBtn.removeEventListener('click', handleSaveFile)
      }
      window.removeEventListener('updateGraph', updateGraph)
    }
  }, [updateGraph])
}
