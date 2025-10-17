// composables/useFileFormatting.ts

export function useFileFormatting() {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileExtension = (filename: string) => {
    return filename
      .slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
      .toLowerCase()
  }

  const getFileType = (filename: string) => {
    const extension = getFileExtension(filename)
    const typeMap: Record<string, string> = {
      // Images
      jpg: 'Image',
      jpeg: 'Image',
      png: 'Image',
      gif: 'Image',
      webp: 'Image',
      svg: 'Image',
      // Documents
      pdf: 'PDF Document',
      doc: 'Word Document',
      docx: 'Word Document',
      xls: 'Excel Spreadsheet',
      xlsx: 'Excel Spreadsheet',
      ppt: 'PowerPoint',
      pptx: 'PowerPoint',
      txt: 'Text Document',
      // Audio
      mp3: 'Audio',
      wav: 'Audio',
      ogg: 'Audio',
      // Video
      mp4: 'Video',
      mov: 'Video',
      avi: 'Video',
      mkv: 'Video',
      // Archives
      zip: 'Archive',
      rar: 'Archive',
      '7z': 'Archive',
      tar: 'Archive',
      gz: 'Archive',
      // Code
      js: 'JavaScript',
      ts: 'TypeScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      xml: 'XML',
      // Others
      csv: 'CSV File',
      md: 'Markdown',
    }

    return typeMap[extension] || 'Unknown File'
  }

  const formatFileName = (filename: string, maxLength: number = 20) => {
    const extension = getFileExtension(filename)
    const nameWithoutExt = filename.slice(0, filename.lastIndexOf('.'))

    if (nameWithoutExt.length <= maxLength) return filename

    return `${nameWithoutExt.slice(0, maxLength)}...${extension}`
  }

  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename)
    const iconMap: Record<string, string> = {
      // Images
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️',
      svg: '🖼️',
      // Documents
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📊',
      pptx: '📊',
      txt: '📄',
      // Audio
      mp3: '🎵',
      wav: '🎵',
      ogg: '🎵',
      // Video
      mp4: '🎥',
      mov: '🎥',
      avi: '🎥',
      mkv: '🎥',
      // Archives
      zip: '📦',
      rar: '📦',
      '7z': '📦',
      // Code
      js: '📜',
      ts: '📜',
      html: '📜',
      css: '📜',
      // Others
      csv: '📊',
      md: '📝',
    }

    return iconMap[extension] || '📄'
  }

  const formatFileDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const isImageFile = (filename: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    return imageExtensions.includes(getFileExtension(filename))
  }

  const isDocumentFile = (filename: string) => {
    const docExtensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
    ]
    return docExtensions.includes(getFileExtension(filename))
  }

  const formatFilePermissions = (permissions: string) => {
    // Convert Unix-style permissions (e.g., '644') to readable format
    const permMap = {
      0: '---',
      1: '--x',
      2: '-w-',
      3: '-wx',
      4: 'r--',
      5: 'r-x',
      6: 'rw-',
      7: 'rwx',
    } as const

    return permissions
      .split('')
      .map((p) => permMap[p as keyof typeof permMap])
      .join('')
  }

  return {
    formatFileSize,
    getFileExtension,
    getFileType,
    formatFileName,
    getFileIcon,
    formatFileDate,
    isImageFile,
    isDocumentFile,
    formatFilePermissions,
  }
}
