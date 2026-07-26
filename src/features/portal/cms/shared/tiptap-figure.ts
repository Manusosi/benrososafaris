import { Node, mergeAttributes } from '@tiptap/core';

/** Block wrapper so in-article images can keep a caption through edit/save cycles. */
export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'image figcaption?',
  defining: true,
  parseHTML() {
    return [{ tag: 'figure' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { class: 'benroso-article-figure' }), 0];
  }
});

export const Figcaption = Node.create({
  name: 'figcaption',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'figcaption' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['figcaption', mergeAttributes(HTMLAttributes), 0];
  }
});
