<template>
  <DocsLayout>
    <div class="text-text font-mono text-sm leading-relaxed">

      <!-- Page title -->
      <h1 class="font-head font-black text-3xl uppercase text-accent tracking-wide mb-2">Guide</h1>
      <p class="text-muted text-sm mb-10">Everything you need to build conditional forms with Pathwise.</p>

      <hr class="border-border mb-10" />

      <!-- Getting Started -->
      <section class="mb-12">
        <h2 class="font-head font-black text-xl text-text pb-2 border-b border-border mb-6">Getting Started</h2>

        <p class="text-muted mb-4">
          Open the dashboard from the home page or navigate directly to <code class="text-accent-2 bg-surface text-xs rounded px-1.5 py-0.5">/dashboard</code>.
          The dashboard lists all of your flows — click <span class="text-text font-bold">+ Create flow</span> to start a new one, or click any existing flow to edit it.
          Inside a flow, the left sidebar is your control panel and the canvas on the right is where your form takes shape as a node graph.
        </p>

        <h3 class="font-mono font-bold text-muted text-xs uppercase tracking-widest mt-8 mb-3">Adding your first field</h3>
        <ul class="list-none space-y-1.5 pl-0 mb-6">
          <li class="pl-4 border-l border-border">Enter a label for your field in the <span class="text-text font-bold">Label</span> input.</li>
          <li class="pl-4 border-l border-border">Choose a field type from the dropdown.</li>
          <li class="pl-4 border-l border-border">Mark it as required if needed, then click <span class="text-text font-bold">Save</span>.</li>
          <li class="pl-4 border-l border-border">A node appears on the canvas. Your first node is automatically set as the <span class="text-accent">start</span> of the form.</li>
        </ul>

        <h3 class="font-mono font-bold text-muted text-xs uppercase tracking-widest mt-8 mb-3">Editing a field</h3>
        <ul class="list-none space-y-1.5 pl-0 mb-6">
          <li class="pl-4 border-l border-border">Click any node on the canvas to select it — the sidebar switches to edit mode for that field.</li>
          <li class="pl-4 border-l border-border">Modify any property and click <span class="text-text font-bold">Save</span> to apply.</li>
          <li class="pl-4 border-l border-border">To change which node is the form's entry point, click the <span class="text-text font-bold">Set as start</span> option in the field list.</li>
        </ul>
      </section>

      <!-- Field Types -->
      <section class="mb-12">
        <h2 class="font-head font-black text-xl text-text pb-2 border-b border-border mb-6">Field Types</h2>

        <p class="text-muted mb-6">Pathwise supports 7 field types. Types marked with a <span class="text-accent font-bold">*</span> support multi-branch routing — each answer option can point to a different next node.</p>

        <div class="space-y-4">
          <div class="p-4 rounded-lg border border-border bg-surface">
            <p class="text-text font-bold mb-1">Text</p>
            <p class="text-muted text-xs">A single-line free-text input. Use for short answers like names, emails, or identifiers.</p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-surface">
            <p class="text-text font-bold mb-1">Textarea</p>
            <p class="text-muted text-xs">A multi-line free-text input. Use for longer responses like descriptions or feedback.</p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-surface">
            <p class="text-text font-bold mb-1">Number</p>
            <p class="text-muted text-xs">A numeric input. Enforces numeric-only entry.</p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-surface">
            <p class="text-text font-bold mb-1">Checkbox</p>
            <p class="text-muted text-xs">A single boolean toggle — yes or no, true or false.</p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-surface">
            <p class="text-text font-bold mb-1">Dropdown <span class="text-accent text-xs">*</span></p>
            <p class="text-muted text-xs">A select menu with predefined options. Each option can route to a different node.</p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-surface">
            <p class="text-text font-bold mb-1">Radio <span class="text-accent text-xs">*</span></p>
            <p class="text-muted text-xs">A set of mutually exclusive choices rendered as radio buttons. Supports per-option routing.</p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-surface">
            <p class="text-text font-bold mb-1">Multiselect <span class="text-accent text-xs">*</span></p>
            <p class="text-muted text-xs">Allows selecting multiple options at once. Each option can still define its own target node.</p>
          </div>
        </div>
      </section>

      <!-- Branching Logic -->
      <section class="mb-12">
        <h2 class="font-head font-black text-xl text-text pb-2 border-b border-border mb-6">Branching Logic</h2>

        <p class="text-muted mb-4">
          Pathwise is built around conditional branching — the path a user takes through your form depends on their answers.
          Connections between nodes are drawn as edges on the canvas.
        </p>

        <h3 class="font-mono font-bold text-muted text-xs uppercase tracking-widest mt-8 mb-3">Connecting nodes</h3>
        <ul class="list-none space-y-1.5 pl-0 mb-6">
          <li class="pl-4 border-l border-border">Drag from the <span class="text-text font-bold">handle</span> on the bottom of one node to the top of another to create a connection.</li>
          <li class="pl-4 border-l border-border">For simple types (text, textarea, number, checkbox), a direct edge is created immediately.</li>
          <li class="pl-4 border-l border-border">For branching types (dropdown, radio, multiselect), a prompt appears in the sidebar asking which answer option this connection should represent — select one and confirm.</li>
        </ul>

        <h3 class="font-mono font-bold text-muted text-xs uppercase tracking-widest mt-8 mb-3">Editing an edge label</h3>
        <ul class="list-none space-y-1.5 pl-0 mb-6">
          <li class="pl-4 border-l border-border">Click any edge on the canvas to select it.</li>
          <li class="pl-4 border-l border-border">The sidebar switches to edge-edit mode — you can rename or delete the connection.</li>
        </ul>

        <h3 class="font-mono font-bold text-muted text-xs uppercase tracking-widest mt-8 mb-3">Reorganizing the canvas</h3>
        <ul class="list-none space-y-1.5 pl-0 mb-6">
          <li class="pl-4 border-l border-border">Use the <span class="text-text font-bold">Fit View</span> button in the nav to zoom to fit all nodes.</li>
          <li class="pl-4 border-l border-border">In the field list panel, drag rows to reorder them — this also affects the auto-layout order.</li>
          <li class="pl-4 border-l border-border">Click <span class="text-text font-bold">Reorganize</span> (in the field list) to automatically arrange nodes in a clean vertical flow.</li>
        </ul>
      </section>

      <!-- Preview & Share -->
      <section class="mb-12">
        <h2 class="font-head font-black text-xl text-text pb-2 border-b border-border mb-6">Preview, Publish &amp; Share</h2>

        <p class="text-muted mb-4">
          Each flow has two distinct links: a private <span class="text-text font-bold">preview</span> link for testing while you build, and a public <span class="text-text font-bold">publish</span> link for sharing with respondents.
        </p>

        <h3 class="font-mono font-bold text-muted text-xs uppercase tracking-widest mt-8 mb-3">Preview (for builders)</h3>
        <ul class="list-none space-y-1.5 pl-0 mb-6">
          <li class="pl-4 border-l border-border">Clicking <span class="text-text font-bold">Preview</span> opens <code class="text-accent-2 bg-surface text-xs rounded px-1.5 py-0.5">/preview/:id</code> in a new tab.</li>
          <li class="pl-4 border-l border-border">Preview works for both <span class="text-text font-bold">draft</span> and <span class="text-text font-bold">published</span> flows — use it freely while editing.</li>
          <li class="pl-4 border-l border-border">Preview traversals are <span class="text-text font-bold">never counted</span> in the stats page — they're just for testing.</li>
        </ul>

        <h3 class="font-mono font-bold text-muted text-xs uppercase tracking-widest mt-8 mb-3">Publish &amp; Share</h3>
        <ul class="list-none space-y-1.5 pl-0 mb-6">
          <li class="pl-4 border-l border-border">Toggle the <span class="text-text font-bold">Publish</span> pill in the builder nav (or from a flow card on the dashboard) to flip a flow from <span class="text-text font-bold">draft</span> to <span class="text-text font-bold">published</span>.</li>
          <li class="pl-4 border-l border-border">Clicking <span class="text-text font-bold">Share</span> copies the public link <code class="text-accent-2 bg-surface text-xs rounded px-1.5 py-0.5">/p/:id</code> to your clipboard. Draft flows can't be shared.</li>
          <li class="pl-4 border-l border-border">Visitors on the public link see only the form — no builder affordances. Visits and completions are counted on the stats page.</li>
          <li class="pl-4 border-l border-border">Flow state is persisted in <code class="text-accent-2 bg-surface text-xs rounded px-1.5 py-0.5">localStorage</code>, so the shared link works as long as it's opened in the same browser.</li>
        </ul>
      </section>

    </div>
  </DocsLayout>
</template>
