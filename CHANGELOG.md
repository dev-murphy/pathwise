# Changelog

## [1.5.0](https://github.com/dev-murphy/pathwise/compare/v1.4.0...v1.5.0) (2026-05-14)

### ✨ Features

* **app:** option-to-node routing, drag-to-reorder field list, order-aware reorganize ([4aaefc3](https://github.com/dev-murphy/pathwise/commit/4aaefc3452ac975a5583f5ba1b09999e3b399178))
* **app:** pivot to flow-based form builder ([1d6e7dc](https://github.com/dev-murphy/pathwise/commit/1d6e7dc1fa971df5ae1f197c2d0f4854bf3cb4fe))
* **components:** extract AppNav, FieldPanel, EdgePanel, ConnectionPanel, FieldList, FlowCanvas from dashboard ([14b0265](https://github.com/dev-murphy/pathwise/commit/14b0265164b14dd19a524880c0c6879c67a5f612))
* **composables:** add useFormStore for localStorage form persistence ([fd7914e](https://github.com/dev-murphy/pathwise/commit/fd7914e56507ea26403789d19e6ac290e7494c8a))
* **icons:** add Checkbox, Home, ArrowLeft, ChartBar, Eye, Share, ExternalLink, AlertCircle, LayoutDashboard from Tabler Icons ([0996dde](https://github.com/dev-murphy/pathwise/commit/0996dded0acd6eb1d4f515047c2c04250eb8ec7f))
* **pages:** add landing page, 404, preview, and stats pages ([e9a8751](https://github.com/dev-murphy/pathwise/commit/e9a8751c87d29a9174f9ff04fc108f7f81b855fc))
* **router:** add Vue Router with file-based routing, update app shell and types ([544b82b](https://github.com/dev-murphy/pathwise/commit/544b82b0ecb75d31c0527ed1b85f25e39bfb53b3))
* **types:** add FIELD_TYPE_ICONS map for field type to icon component mapping ([3a8246f](https://github.com/dev-murphy/pathwise/commit/3a8246f272a6ff30a9b604da20518d3b8ffae2a8))
* **types:** add flow domain types for form builder ([830ebf2](https://github.com/dev-murphy/pathwise/commit/830ebf2b7572c6f061e1ee574321466bb1bd0c42))
* **types:** add targetNodeId to FieldOption, add multiselect to MULTI_BRANCH_TYPES ([7993feb](https://github.com/dev-murphy/pathwise/commit/7993febec2aa62ef66bc553876b3866ac9cba790))
* **ui:** add iconOptions prop to XSelect for icon-per-option rendering ([66a6906](https://github.com/dev-murphy/pathwise/commit/66a6906fc4799ef07f2d8f0d390773199086292f))

### 🐛 Bug Fixes

* **config:** restore DevTools plugin, update package description ([986e98b](https://github.com/dev-murphy/pathwise/commit/986e98bbf446895f679b6546f4c9fc7ff5cb65ae))

### 🧹 Miscellaneous

* add links to homepage footer ([5be1a59](https://github.com/dev-murphy/pathwise/commit/5be1a596449ff5cca40e20dfd605e9b2341c3b89))

### 📖 Documentation

* **readme:** rewrite for form builder pivot ([153d3e0](https://github.com/dev-murphy/pathwise/commit/153d3e07ace0d1a6119b7b469e34713b03fac91d))

### 🔨 Code Refactors

* **dashboard:** slim down to coordinator using extracted sub-components ([fc0bc46](https://github.com/dev-murphy/pathwise/commit/fc0bc46d7c8479590cb9e9f4afd551447c2a81e5))

### 💅 UI Updates

* fix text color for non hovered element ([4312b8a](https://github.com/dev-murphy/pathwise/commit/4312b8a1111334bd53deeb57d15c2e03037886fd))
* **flow:** add field type pill to QuestionNode header ([1d4fc52](https://github.com/dev-murphy/pathwise/commit/1d4fc527fb984d9b1a33b3bdadd441d3b470ad3b))
* **flow:** show required asterisk on QuestionNode label ([1a0dded](https://github.com/dev-murphy/pathwise/commit/1a0ddedd534f029a88ce136347ec69ab3050c939))
* **meta:** update title, description, keywords and OG tags for form builder ([9aa70b3](https://github.com/dev-murphy/pathwise/commit/9aa70b3acf68a6f0dbebbff3db64704638e75b54))

## [1.4.0](https://github.com/dev-murphy/pathwise/compare/v1.3.0...v1.4.0) (2026-05-14)

### ✨ Features

* **app:** implement decision tree editor with question/answer flow ([8bb14a3](https://github.com/dev-murphy/pathwise/commit/8bb14a3ae1af46744e07de9248dea0a5ff085404))
* **flow:** add QuestionNode and FlowEdge components, remove unused scaffolding ([559bcac](https://github.com/dev-murphy/pathwise/commit/559bcac5cde9332a901c66bb960050d65b4e0b1a))
* **ui:** add displayOptions prop to XSelect for label/value separation ([6d006a2](https://github.com/dev-murphy/pathwise/commit/6d006a293dbbdb4be802b7ba4c45541cf31750d5))

### 📖 Documentation

* move commit guidelines to CONTRIBUTING.md, simplify README releases section ([4ab961d](https://github.com/dev-murphy/pathwise/commit/4ab961d52949fe0232ad7ed8e32e9cc4cbf9d7de))
* **readme:** expand getting started with dev and production build instructions ([b9a6c9a](https://github.com/dev-murphy/pathwise/commit/b9a6c9ab74d50e80957db997376bffa80f7501f8))
* **readme:** rewrite readme to reflect current decision tree editor ([f627e58](https://github.com/dev-murphy/pathwise/commit/f627e58c615740a11bc99571726595c29d2035f6))

## [1.3.0](https://github.com/dev-murphy/pathwise/compare/v1.2.1...v1.3.0) (2026-05-14)

### ✨ Features

* added vue flow to app ([c8de110](https://github.com/dev-murphy/pathwise/commit/c8de110b894d10d6022d072bfa9b6dc885295858))

## [1.2.1](https://github.com/dev-murphy/pathwise/compare/v1.2.0...v1.2.1) (2026-05-14)

### 🧹 Miscellaneous

* add auto import plugins and vueuse to app, refactored x-select component ([a2fff6f](https://github.com/dev-murphy/pathwise/commit/a2fff6ff02c547691d6f1619a86fa2de47e5839c))
* add favicon, logo and seo meta tags to app ([1f07d75](https://github.com/dev-murphy/pathwise/commit/1f07d753f8603316880ea2d48a0170977f7c31b7))

## [1.2.0](https://github.com/dev-murphy/pathwise/compare/v1.1.0...v1.2.0) (2026-05-14)

### ✨ Features

* add basic UI for app ([6ad4227](https://github.com/dev-murphy/pathwise/commit/6ad42278050a91c404747f07d6472784dfbd8906))

## [1.1.0](https://github.com/dev-murphy/pathwise/compare/v1.0.0...v1.1.0) (2026-05-14)

### ✨ Features

* remove boilerplate code ([7a5b1c7](https://github.com/dev-murphy/pathwise/commit/7a5b1c7a31a6830a43ac546888f02ba63641d59c))

### 🧹 Miscellaneous

* add alias to app ([6ce7714](https://github.com/dev-murphy/pathwise/commit/6ce77143fa5095030c7f722d35fd9927dca30c50))
* add tailwindcss to app ([e8bcc58](https://github.com/dev-murphy/pathwise/commit/e8bcc582e09016c3c40da520dcbe38ad137b1c82))

### 📖 Documentation

* add MIT license ([15bd24f](https://github.com/dev-murphy/pathwise/commit/15bd24f746ddeb54d3a8e952a4c485300bf3655e))

## 1.0.0 (2026-05-14)

### ✨ Features

* initial commit ([8e6a5a5](https://github.com/dev-murphy/pathwise/commit/8e6a5a5cbca31e32f6709df9538265cef6c70382))

### 📖 Documentation

* add package manager, home page and other info to package manager ([3d4e616](https://github.com/dev-murphy/pathwise/commit/3d4e6169ee866c073cf78d84fe2ad0137b061222))

### ⚙️ CI/CD

* add release action to github ([d6bdbb7](https://github.com/dev-murphy/pathwise/commit/d6bdbb705e90ca9eddaf10e5624dbcc4f94a0e6d))
* ensure pages redirect works on vercel ([59f6c34](https://github.com/dev-murphy/pathwise/commit/59f6c34a34edf5b5c5819481d211e9a97606c6dc))
