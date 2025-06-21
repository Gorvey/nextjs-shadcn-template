'use client'

import { NotionRenderer } from 'react-notion-x'

interface NotionPageProps {
  recordMap: any
  rootPageId: string
}

export default function NotionPage({ recordMap, rootPageId }: NotionPageProps) {
  return (
    <article className="notion-container">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={false}
        rootPageId={rootPageId}
        previewImages={true}
        showTableOfContents={true}
        minTableOfContentsItems={3}
        defaultPageIcon="📄"
        defaultPageCoverPosition={0.5}
        forceCustomImages={true}
        showCollectionViewDropdown={false}
        // 自定义页面URL映射
        mapPageUrl={(pageId) => {
          return `/blog/${pageId}`
        }}
      />
    </article>
  )
}
