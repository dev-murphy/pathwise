<script setup lang="ts">
import ChangelogContent from '../../../CHANGELOG.md'
</script>

<template>
  <DocsLayout>
    <div class="
      prose-changelog
      text-text font-mono text-sm leading-relaxed

      [&_h1]:font-head [&_h1]:font-black [&_h1]:text-3xl [&_h1]:uppercase [&_h1]:text-accent [&_h1]:tracking-wide [&_h1]:mb-10
      [&_h2]:font-head [&_h2]:font-black [&_h2]:text-xl [&_h2]:text-text [&_h2]:mt-12 [&_h2]:mb-2 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border
      [&_h3]:font-mono [&_h3]:font-bold [&_h3]:text-muted [&_h3]:text-xs [&_h3]:uppercase [&_h3]:tracking-widest [&_h3]:mt-8 [&_h3]:mb-3

      [&_ul]:list-none [&_ul]:space-y-1.5 [&_ul]:pl-0 [&_ul]:mb-6
      [&_li]:text-text [&_li]:pl-4 [&_li]:border-l [&_li]:border-border [&_li]:text-sm

      [&_a]:text-accent [&_a]:no-underline [&_a:hover]:underline [&_a:hover]:decoration-accent

      [&_code]:font-mono [&_code]:text-accent-2 [&_code]:text-xs [&_code]:bg-surface [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5

      [&_hr]:border-border [&_hr]:my-10

      [&_p]:text-muted [&_p]:text-sm [&_p]:mb-4
    ">
      <ChangelogContent />
    </div>
  </DocsLayout>
</template>
