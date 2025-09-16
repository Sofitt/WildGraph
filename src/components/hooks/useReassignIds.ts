import { useCallback } from 'react'
import type { GraphData } from '@/components/types/graph'
import { reassignNodeIds } from '@/lib/reassignNodeIds'

export function useReassignIds() {
  const reassignIds = useCallback((graphData: GraphData): GraphData => {
    console.log('Переназначение ID узлов...')
    const updatedGraphData = reassignNodeIds(graphData)
    console.log('ID переназначены успешно')
    return updatedGraphData
  }, [])

  return { reassignIds }
}
