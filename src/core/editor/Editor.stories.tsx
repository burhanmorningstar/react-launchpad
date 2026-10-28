import * as React from 'react'

import { RichTextContent } from './RichTextContent'
import { RichTextEditor } from './RichTextEditor'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof RichTextEditor> = {
  title: 'Core/Editor/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof RichTextEditor>

export const Default: Story = {
  render: function DefaultEditor() {
    const [value, setValue] = React.useState(
      '<p>Welcome to the <strong>Rich Text Editor</strong>! Feel free to edit this content.</p>'
    )
    return (
      <div className="space-y-4 max-w-xl">
        <RichTextEditor
          value={value}
          onChange={setValue}
          ariaLabel="Article body"
        />
        <div className="rounded-md border p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
            Sanitized Output Preview
          </div>
          <RichTextContent content={value} />
        </div>
      </div>
    )
  },
}

export const ReadOnly: Story = {
  render: () => (
    <div className="max-w-xl">
      <RichTextEditor
        value="<p>This content is <em>read only</em> and cannot be edited by the user.</p>"
        onChange={() => {}}
        readOnly
      />
    </div>
  ),
}
