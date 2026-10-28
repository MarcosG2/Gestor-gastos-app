import { useCallback, useEffect, useState } from 'react'
import { fetchCategories } from '../services/categories'

export function useCategories(userId) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) return { data: [], error: null }
    setLoading(true)
    const result = await fetchCategories(userId)
    if (!result.error) setCategories(result.data || [])
    setLoading(false)
    return result
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setCategories([])
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    fetchCategories(userId).then(({ data, error }) => {
      if (!active) return
      if (!error) setCategories(data || [])
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [userId])

  return { categories, loading, reload }
}
