export type FileType = 'image' | 'pdf' | 'word' | 'ppt'

export interface Protocol {
  id: string
  title: string
  category: string
  tags: string[]
  fileName: string
  fileType: FileType
  githubPath: string
  updatedAt: string
  isLatest: boolean
}

export interface Category {
  id: string
  label: string
  emoji: string
}

export type AdminView = 'upload' | 'edit' | 'categories'
