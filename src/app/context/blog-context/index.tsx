'use client'
import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react'
import useSWR from 'swr'
import { BlogPostType, BlogType } from '@/app/(DashboardLayout)/types/blog'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface BlogContextProps {
  posts: BlogPostType[]
  sortBy: string
  selectedPost: BlogPostType | null
  isLoading: boolean
  setPosts: Dispatch<SetStateAction<BlogPostType[]>>
  setSortBy: Dispatch<SetStateAction<string>>
  setSelectedPost: Dispatch<SetStateAction<BlogPostType | null>>
  setLoading: Dispatch<SetStateAction<boolean>>
  addComment: (postId: string, newComment: BlogType) => void
  fetchPostById: (id: string) => Promise<void>
  error: string | Error | null
}

export const BlogContext = createContext<BlogContextProps>({
  posts: [],
  sortBy: 'newest',
  selectedPost: null,
  isLoading: true,
  setPosts: () => {},
  setSortBy: () => {},
  setSelectedPost: () => {},
  setLoading: () => {},
  addComment: () => {},
  fetchPostById: async () => {},
  error: null,
})

export const BlogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<BlogPostType[]>([])
  const [sortBy, setSortBy] = useState<string>('newest')
  const [selectedPost, setSelectedPost] = useState<BlogPostType | null>(null)

  const { data, isLoading, error } = useSWR<{ status: number; data: BlogPostType[]; msg?: string }>(
    '/api/blog',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

  React.useEffect(() => {
    if (data?.status === 200) {
      setPosts(data.data)
    }
  }, [data])

  const fetchPostById = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/blog/${id}`)
      const result = await res.json()
      if (result.status === 200) {
        setSelectedPost(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch post:', err)
    }
  }, [])

  const addComment = useCallback(async (postId: string, newComment: BlogType) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [newComment, ...(post.comments || [])] }
          : post
      )
    )

    try {
      await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, comment: newComment }),
      })
    } catch (err) {
      console.error('Failed to save comment:', err)
    }
  }, [])

  const value: BlogContextProps = {
    posts,
    sortBy,
    selectedPost,
    isLoading,
    setPosts,
    setSortBy,
    setSelectedPost,
    setLoading: () => {},
    addComment,
    fetchPostById,
    error: error || null,
  }

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>
}
