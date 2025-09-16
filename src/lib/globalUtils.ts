import type { GraphData } from '@/components/types/graph'
import { reassignNodeIds } from './reassignNodeIds'

/**
 * Глобальные утилиты для работы с графом
 * Доступны через window.graphUtils в консоли браузера
 */
export const graphUtils = {
  /**
   * Переназначает ID всех узлов в порядке возрастания
   * Использование в консоли: window.graphUtils.reassignIds(graphData)
   */
  reassignIds: (graphData: GraphData): GraphData => {
    console.log('🔄 Начинаю переназначение ID узлов...')
    console.log('Текущие узлы:', graphData.nodes.map(n => ({ id: n.id, name: n.name })))
    
    const updatedGraphData = reassignNodeIds(graphData)
    
    console.log('✅ ID переназначены успешно!')
    console.log('Новые узлы:', updatedGraphData.nodes.map(n => ({ id: n.id, name: n.name })))
    
    return updatedGraphData
  },

  /**
   * Показывает текущие ID узлов
   */
  showNodeIds: (graphData: GraphData): void => {
    console.table(graphData.nodes.map(n => ({ 
      id: n.id, 
      name: n.name,
      anchors: n.anchor.join(', ') || 'нет'
    })))
  }
}

// Делаем утилиты доступными глобально
if (typeof window !== 'undefined') {
  (window as any).graphUtils = graphUtils
}
