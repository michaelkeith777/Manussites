# Trading Card AI Generator - TODO

## Core Features

### Step 1: Trending Topic Discovery
- [x] AI-powered search for trending topics from Facebook, TikTok, trading platforms
- [x] Display trending topics as selectable list with categories
- [x] Allow custom topic input as alternative
- [x] Animated topic cards with hover effects

### Step 2: AI Prompt Generation
- [x] Convert selected/custom topics into optimized image prompts using LLM
- [x] Optional 'Enhance' button to refine and improve prompts
- [x] Display generated prompt with edit capability
- [x] Smooth transition animation from Step 1

### Step 3: Image Variance Selection
- [x] Allow users to choose 1-10 image variations
- [x] Visual slider or number selector with animations
- [x] Model selection (Nano Banana vs Nano Banana Pro)
- [ ] Preview of estimated generation time

### Step 4: Real-time Progress Tracking
- [x] Animated progress bar for image generation
- [x] Status updates showing current generation state
- [x] Integration with kie.ai API for task polling
- [ ] Cancel generation option

### Step 5: Image Selection & Download
- [x] Grid display of generated images
- [x] Image selection with visual feedback
- [x] Download selected images (single or batch)
- [x] Option to save to gallery

## Gallery System
- [x] Left sidebar gallery showing all generated images
- [x] Thumbnail view with lazy loading
- [x] Add to favorites (heart icon)
- [x] Recreate button to return to creation with original prompt
- [x] Filter by favorites, date, model used
- [x] Delete images from gallery

## Backend & Database
- [x] Database schema for users, images, prompts, favorites
- [x] tRPC routes for trending topics discovery
- [x] tRPC routes for prompt generation with LLM
- [x] tRPC routes for kie.ai image generation
- [x] tRPC routes for gallery CRUD operations
- [x] Webhook/polling for kie.ai task status

## UI/UX Polish
- [x] Beautiful purple-themed dark mode design
- [x] Smooth animations between all steps
- [x] Animated progress indicators
- [x] Micro-interactions throughout
- [x] Responsive design for all screen sizes
- [x] Loading skeletons and states
- [x] Error handling with friendly messages

## Integration
- [x] kie.ai API integration for Nano Banana
- [x] kie.ai API integration for Nano Banana Pro
- [x] S3 storage for generated images
- [x] LLM integration for prompt generation

## Testing
- [x] Unit tests for backend routes
- [ ] Test image generation flow
- [ ] Test gallery operations


## New Features (User Request)

### User API Key Management
- [x] Add kieApiKey field to users table
- [x] Create settings page for API key management
- [x] Backend route to save/update user API key
- [x] Backend route to get user API key status (masked)
- [x] Use user's API key for image generation if available

### Card-Sized Image Generation
- [x] Update aspect ratio options to focus on trading card dimensions
- [x] Set default to 2:3 (standard trading card ratio)
- [x] Update prompts to focus on artwork only (no card frames)


## Bug Fixes & New Features (User Request - Jan 12)

### Bug Fixes
- [x] Fix download functionality - images not downloading to device
- [x] Fix gallery not showing generated images (images are stored in S3)

### User Onboarding
- [x] Create onboarding flow for new users
- [x] Add step-by-step instructions for getting kie.ai API key
- [x] Guide users to Settings page to add their API key
- [x] Show onboarding only for first-time users

### API Key Management
- [x] Ensure API key is user-specific and only works for their account
- [x] Improve API key input UI in Settings


## Sports-Focused AI Analyzer (User Request - Jan 12)

### Sports Topic Research
- [x] Focus exclusively on basketball and football topics
- [x] Research current sports news and headlines
- [x] Analyze player highlights and achievements
- [x] Include historical player moments and legends
- [x] Generate compelling topics for trading card artwork

### Categories to Include
- [x] NBA basketball players and news
- [x] NFL football players and news
- [x] Player milestones and records
- [x] Iconic historical moments
- [x] Rising stars and rookies

### UI Updates
- [x] Add sport category selector (Basketball/Football)
- [x] Display topics organized by category
- [x] Show player names and context with topics
- [x] Update prompt generation for sports artwork
- [x] Add art style selector (realistic, dynamic, vintage, etc.)


## New Features (User Request - Jan 12, Part 2)

### Player Search
- [x] Add player search API endpoint
- [x] Search by player name across all sports
- [x] Return player details with team info
- [x] Integrate with trending topics UI

### Team-Based Filtering
- [x] Add team filter dropdown
- [x] NBA teams list (30 teams)
- [x] NFL teams list (32 teams)
- [x] NCAA teams list (top programs)
- [x] Filter topics by selected team

### College Sports Support
- [x] Add NCAA Basketball support
- [x] Add NCAA Football support
- [x] Include March Madness category
- [x] Include College Football Playoff category
- [x] Add college player highlights and stars


## Bug Fix (User Report - Jan 12)

### Scrolling Issue
- [x] Fix scrolling issue on Create page - was caused by empty SelectItem value
- [x] Page now scrollable and all content accessible
- [x] Tested - all steps working properly


## New Features (User Request - Jan 12, Part 3)
### Prompt History

- [x] Add promptHistory table to database schema
- [x] Create backend API to save prompts after generation
- [x] Create backend API to list user's prompt history
- [x] Create backend API to delete prompt history items
- [x] Add prompt history panel/dropdown in Create page
- [x] Allow users to click on history item to reuse prompt
- [x] Show topic, prompt preview, and timestamp for each item

### Image Editing Tools
- [x] Add image editor component with canvas
- [x] Implement cropping tool with aspect ratio presets
- [x] Add brightness/contrast adjustments
- [x] Add saturation adjustment
- [x] Implement zoom and pan controls
- [x] Add reset button to restore original
- [x] Save edited image and update download
- [x] Integrate editor into Gallery page
- [x] Integrate editor into Create page (step 5)


## New Features (User Request - Jan 12, Part 4)

### Prompt Templates Library
- [x] Create preset prompt styles collection (16 templates)
- [x] Action shot template
- [x] Portrait template
- [x] Vintage card template
- [x] Holographic/foil template
- [x] Comic book style template
- [x] Realistic photo template
- [x] Add template selector UI in Create page
- [x] Apply template to enhance prompts
- [x] Template categories: Action, Portrait, Artistic, Special Effects

### Image Watermarking
- [x] Create watermark editor component
- [x] Text watermark with custom font/size/color
- [x] Position controls (9 positions + tiled)
- [x] Opacity slider for watermark
- [x] Rotation control for watermark
- [x] Optional logo/image watermark upload
- [x] Live preview of watermark
- [x] Apply watermark before download
- [x] Integrate into Gallery page
- [x] Integrate into Create page (step 5)


## Bug Fix & New Features (User Report - Jan 13)

### Image Retrieval Bug
- [x] Fix images not being retrieved from kie.ai after job submission (API tested and working)
- [x] Debug task status polling and image URL extraction (fixed model-specific status endpoints)
- [x] Ensure images are properly saved to database and S3 (added user API key to status check)

### New Model Support
- [x] Research Grok Imagine API from kie.ai
- [x] Research OpenAI 4o Image API from kie.ai
- [x] Add Grok Imagine model integration
- [x] Add OpenAI 4o model integration
- [x] Update model selector UI with new options (4 models now available)
- [x] Update database schema for new models
- [ ] Test all model generations


## Bug Fixes (User Report - Jan 13, Part 2)

### Progress Tracking Issue
- [x] Fix progress stuck on "generating" - status mapping was wrong (API returns 'success' not 'done')
- [x] Debug status polling to ensure it detects completion
- [x] Transition to step 5 when images are ready

### Download Not Working
- [x] Fix download button functionality in Create page step 5
- [x] Fix download button functionality in Gallery page
- [x] Added fallback methods for CORS issues
- [x] Added delay between multiple downloads to prevent browser blocking

### Image Viewer Modal Issues
- [x] Fix modal display - added proper bg-background and text-foreground classes
- [x] Added min-height to ensure modal is visible
- [x] Added error handling for missing images
- [x] Fixed image container styling


## Bug Fix (User Report - Jan 13, Part 3)

### Gallery Image Interaction
- [x] Fix images not clickable in Gallery - images are clickable and dialog opens
- [x] Fix image viewer not opening when clicking images - dialog displays properly
- [x] Fix edit functionality not working - added CORS handling for image loading in editor
- [x] Ensure all image actions are accessible - all buttons visible and working


## Watermark Enhancement (User Request - Jan 13)

### Drag-and-Drop Positioning
- [x] Add drag-and-drop functionality for watermark
- [x] Allow free positioning anywhere on the image (Custom position option)
- [x] Show position coordinates as user drags (X%, Y%)
- [x] Maintain position when switching tabs
- [x] Support both mouse and touch drag
- [x] Added X/Y position sliders for precise control

### Size Options
- [x] Add watermark size slider (extended range 12-120px for text, 10-300% for images)
- [x] Add preset size options (small, medium, large, custom)
- [x] Scale text and logo watermarks proportionally
- [x] Preview size changes in real-time
- [x] Extended rotation range to -180° to 180°


## New Features (User Request - Jan 13, Part 5)

### Saved Watermark Presets
- [x] Add watermarkPresets table to database schema
- [x] Create backend routes for CRUD operations on presets
- [x] Add preset save button to Watermark component
- [x] Add preset selector dropdown to Watermark component
- [x] Allow users to name and manage their presets
- [x] Load preset settings when selected

### Image Comparison View
- [x] Create ImageComparison component for side-by-side view
- [x] Support comparing 2-4 images at once
- [x] Add comparison mode toggle in Gallery (Compare button)
- [x] Allow selecting images to compare
- [x] Show model badges on each image
- [x] Multiple view modes: side-by-side, stacked, grid, slider
- [x] Unit tests for watermark presets and comparison features


## Bug Fix (User Report - Jan 13, Part 6)

### Watermark Download Freeze
- [x] Fix screen freeze when downloading watermarked image
- [x] Debug download functionality in Watermark component
- [x] Ensure proper async handling and error recovery


## App Rename (User Request - Jan 13)

### Rename to CardKing1971 Customs
- [x] Update app name in sidebar/navigation
- [x] Update page titles and meta tags
- [x] Update environment variables (VITE_APP_TITLE) - Note: Built-in secret, updated in index.html instead
- [x] Update any hardcoded references to CardForge AI


## Branding Update (User Request - Jan 13)

### Complete CardKing1971 Customs Branding
- [x] Generate custom CardKing1971 Customs logo/icon
- [x] Generate branded favicon
- [x] Update hero section tagline to include CardKing1971 brand name
- [x] Replace sparkles icon with custom logo in sidebar
- [x] Replace sparkles icon with custom logo in mobile header
- [x] Replace sparkles icon with custom logo in footer
- [x] Add favicon to index.html


## UI Enhancements (User Request - Jan 13)

### Animated Logo Effect
- [x] Add hover glow/pulse animation to logo in sidebar
- [x] Add hover animation to logo in mobile header
- [x] Add hover animation to logo in footer

### Loading Splash Screen
- [x] Create SplashScreen component with CardKing1971 logo
- [x] Add fade-in animation for logo
- [x] Integrate splash screen into app initialization

### Open Graph Meta Tags
- [x] Generate social sharing image (1200x630)
- [x] Add og:title, og:description, og:image meta tags
- [x] Add Twitter card meta tags


## New Features (User Request - Jan 13)

### Card Frame Templates
- [x] Design 6 card frame templates (Classic, Fantasy, Sci-Fi, Sports, Anime, Minimalist)
- [x] Generate frame overlay images with transparent centers
- [x] Create CardTemplateSelector component
- [x] Add template selection to Create page
- [x] Apply selected template as overlay on generated images

### Export Formats
- [x] Create ExportDialog component with format options
- [x] Implement PNG export (default, high quality)
- [x] Implement JPG export with quality slider
- [x] Implement PDF export for printing
- [x] Add resolution options (Standard, HD, Print-ready)
- [x] Integrate export options into Gallery image viewer
- [x] Add Export button to Create page Step 5


## Bug Fix (User Report - Jan 13)

### Hero Section Text Cutoff
- [x] Fix hero section heading text that is too large and cutting off
- [x] Adjust responsive text sizing for different screen sizes


### Duplicate Key Errors on Create Page
- [x] Fix duplicate team names causing React key errors (Tennessee Volunteers, Auburn Tigers, Alabama Crimson Tide appear in multiple sports)
- [x] Use unique keys combining team name and sport for team filter dropdown


## Feature Removal (User Request - Jan 13)

### Remove Card Frame Templates
- [x] Remove CardTemplateSelector component import from Create.tsx
- [x] Remove card template state and UI from Create page
- [x] Delete CardTemplateSelector.tsx component file
- [x] Delete template images from public/templates folder


## Bug Fix (User Report - Jan 13)

### Create Page Stuck on "Generating"
- [x] Investigate why generated images don't display on Create page
- [x] Check status polling logic in Create.tsx
- [x] Verify checkStatus query is properly updating generatedImages state
- [x] Fix the issue so completed images show in Step 5 instead of just Gallery
- [x] Added debug logging to track status flow
- [x] Added check for already-completed images in database before API call
- [x] Fixed status mapping to handle all API status values (success, completed, fail, failed, error)


## UX Improvements (User Request - Jan 13)

### Manual Refresh Button
- [x] Add refresh button to Step 4 (Generating) to manually trigger status check
- [x] Show loading state on refresh button while fetching

### Generation Timeout Handling
- [x] Track generation start time
- [x] Show "taking longer than expected" message after 2 minutes
- [x] Add "Continue Waiting" and "Cancel" buttons when timeout message appears
- [x] Handle cancel action to stop polling and return to previous step


## Bug Fix (User Report - Jan 13)

### Images Not Retrieved from kie.ai
- [x] Investigate why completed images from kie.ai are not being retrieved
- [x] Check the status check API response format
- [x] Verify image URL extraction from kie.ai response
- [x] Add detailed logging to trace the issue
- [x] Fixed: OpenAI 4o API returns status as "SUCCESS" (uppercase) and images in response.resultUrls (not result.images)


## Branding Update (User Request - Jan 13)

### Mask Manus Branding from Authentication
- [x] Find all references to "Manus" in the codebase
- [x] Update login button text to remove Manus mention (changed to "Sign In")
- [x] Update any OAuth-related UI text to show CardKing1971 Customs branding
- [x] Ensure the OAuth flow still works while hiding Manus branding
- [x] Update any error messages or loading states that mention Manus
- [x] Renamed ManusDialog to LoginDialog with generic "Sign In" text
- [x] Updated localStorage key from "manus-runtime-user-info" to "cardking1971-user-info"

### Remove Powered by Manus Banner
- [x] Removed "Powered by Nano Banana AI" badge from hero section
- [x] Updated footer text from "Powered by kie.ai Nano Banana" to "AI-Powered Trading Card Art"


## Legal Pages (User Request - Jan 13)

### Terms of Service Page
- [x] Create Terms.tsx page component with standard legal content
- [x] Add route for /terms in App.tsx
- [x] Add Terms of Service link to footer
- [x] Include sections: acceptance, service description, user accounts, intellectual property, prohibited uses, disclaimers, limitation of liability, termination, governing law


### Privacy Policy Page
- [x] Create Privacy.tsx page component with comprehensive privacy content
- [x] Add route for /privacy in App.tsx
- [x] Add Privacy Policy link to footer
- [x] Include sections: data collection, usage, cookies, third-party services, data retention, user rights, security, children's privacy, international transfers, policy changes


## Premium Features (User Request - Jan 13)

### Larger Image Preview
- [ ] Add fullscreen/larger image view before downloading
- [ ] Implement zoom controls and pan functionality

### Card Rarity System
- [ ] Create rarity levels: Common, Rare, Epic, Legendary
- [ ] Auto-assign rarity based on prompt complexity using AI
- [ ] Add holographic border effects for rare cards
- [ ] Add animated sparkle effects for legendary cards
- [ ] Store rarity in database with each card

### Card Stats Generator
- [ ] Create AI-powered stats generation (Power, Speed, Defense, etc.)
- [ ] Design stat display UI on card preview
- [ ] Store stats in database with each card
- [ ] Add stat comparison between cards

### Style Transfer
- [ ] Add reference image upload functionality
- [ ] Integrate style transfer into generation prompt
- [ ] Store style reference with generated cards

### Card Series/Collections
- [ ] Create collections database schema
- [ ] Build collection management UI
- [ ] Add themed borders per collection
- [ ] Implement card numbering (1/100)
- [ ] Add collection progress tracking

### Print-Ready Export
- [ ] Add bleed margin options (3mm, 5mm)
- [ ] Implement CMYK color profile conversion
- [ ] Add crop marks for professional printing
- [ ] Support standard card sizes (2.5x3.5", poker, tarot)

### Deck Builder
- [ ] Create deck management system
- [ ] Build drag-and-drop deck organization UI
- [ ] Implement PDF generation for deck printing
- [ ] Add deck sharing functionality

### Custom Card Backs
- [ ] Create card back designer interface
- [ ] Add template card back options
- [ ] Allow custom image upload for card backs
- [ ] Store card backs per collection

### Signature Cards
- [ ] Add digital signature/watermark system
- [ ] Create signature verification display
- [ ] Add creator badge on cards
- [ ] Implement authenticity verification


## Bug Fixes (User Report - Jan 14)

### Watermark Presets API Error
- [x] Fix watermarkPresets.getDefault returning undefined instead of null

### Cropping Tool Not Working
- [x] Cropping tool functionality verified - works when Crop Mode is enabled

### Dialog Size Too Small
- [x] Enlarge image editing dialog (max-w-6xl, 90vw, 85vh)
- [x] Enlarge watermark dialog (max-w-6xl, 90vw, 85vh)
- [x] Improve image details organization in Gallery for better visibility
- [x] Fix DialogTitle accessibility error in Gallery dialog
- [x] Fix Gallery dialog mobile responsiveness - can't scroll to see Edit button on mobile
- [x] Add close button at top of Gallery dialog for easier dismissal on mobile
- [x] Add swipe gestures to navigate between images in Gallery dialog
- [x] Optimize image loading with lazy loading and lower resolution thumbnails
- [x] Print Layout page - 2.5x3.5 card size, 9-up on 8.5x11 page
- [x] Print Layout page - 4x6 card size, 2-up on 8.5x11 page
- [x] Print Layout - optional crop marks toggle
- [x] Print Layout - select single card from gallery and fill all slots on page
- [x] Print Layout - select multiple cards from gallery for mixed layout
- [x] Print Layout - preview of the print sheet before export
- [x] Print Layout - export/download as printable PDF or image
- [x] Gallery - upload existing photos/images to gallery for use
- [x] Navigation - add Print Layout menu item
- [x] Fix blank cards in Print Layout download - images not rendering in exported PNG
- [x] Fix image loading in Print Layout - add server proxy to bypass CORS on CloudFront CDN
- [x] Add card spacing/gutters between cards on print page for easier cutting
- [x] Integrate PDF export using jsPDF for print shop compatibility
- [x] Add configurable bleed margin for professional printing standards
- [x] Add per-slot loading indicator showing image processing status
- [x] Card back design - select card back image from gallery
- [x] Card back design - upload custom card back image
- [x] Card back design - generate mirrored back sheet for double-sided printing
- [x] Card back design - include back sheet in PDF export
- [x] Card back design - front/back preview toggle in preview panel
- [x] Card Back Designer - canvas-based editor component
- [x] Card Back Designer - background color picker with gradient support
- [x] Card Back Designer - pattern overlays (stripes, dots, diamonds, crosshatch, etc.)
- [x] Card Back Designer - custom text with font, size, color, position controls
- [x] Card Back Designer - border styles (solid, double, ornate, rounded)
- [x] Card Back Designer - live preview of the card back design
- [x] Card Back Designer - export design as image for use in Print Layout
- [x] Card Back Designer - integrate into Print Layout as "Design Custom" option

## Multi-Model Simultaneous Generation (User Request - Feb 7)
- [x] Add multi-model toggle/selector on Create page - allow selecting multiple models at once
- [x] Update backend to support parallel image generation across multiple models
- [x] Show per-model progress tracking during generation
- [x] Display results grouped by model for easy comparison
- [x] All generated images saved to gallery with model labels for comparison

## Bug Fix (User Report - Feb 7)
- [x] Fix PNG download in Print Layout to include both front and back sides when card backs are enabled

## Sticker Creator (User Request - Feb 7)
- [x] Sticker Creator page - new menu item in sidebar navigation
- [x] Shape selection - circle, square, rectangle, oval, rounded square, star, heart, hexagon
- [x] Custom size input - width and height in inches with aspect ratio lock
- [x] Auto-layout calculator - automatically calculate how many stickers fit on 8.5x11 page
- [x] Gallery image picker - select one or multiple photos from gallery
- [x] Proportional image resizing - maintain aspect ratio and quality when fitting to sticker shape
- [x] Live preview canvas - show sticker layout on 8.5x11 page
- [x] Spacing/gutter control between stickers
- [x] Crop marks toggle for cutting guides
- [x] PNG export at 300 DPI
- [x] PDF export via jsPDF
- [x] ZIP download for front sheets
- [x] Multiple images on same page - different stickers from gallery on one sheet
- [x] Fill mode - one image fills all sticker slots on page

## Bug Fix (User Report - Feb 7, Part 2)
- [x] Fix Sticker Creator image proxy failures - all slots failing to load images
- [x] Fix Sticker Creator DialogTitle accessibility error
- [x] Fix Sticker Creator gallery picker showing prompt text instead of actual images

## Sticker Zoom & Pan (User Request - Feb 7)
- [x] Add zoom slider for each sticker image to scale up/down within the shape
- [x] Add drag-to-pan so users can reposition the image within the sticker shape
- [x] Apply zoom/pan offsets to canvas rendering for preview and export
- [x] Per-slot zoom/pan controls in multi-image mode
- [x] Global zoom/pan controls in fill mode (one image fills all slots)
- [x] X/Y pan sliders appear when zoom > 100%
- [x] Reset Position button to restore defaults
- [x] Drag hint text when zoomed in
- [x] Canvas cursor changes to grab/grabbing during drag

## Bug Fix (User Report - Feb 7, Part 3)
- [x] Fix images not showing on stickers (blank circles) - added 3-strategy loading: direct crossOrigin → proxy → untainted fallback
- [x] Fix zoom slider not updating canvas preview - added explicit zoom/pan state to useEffect deps
- [x] Add fallback direct image loading when proxy fails
- [x] Add loading indicator overlay on preview canvas
- [x] Add image cache to avoid re-downloading on zoom/pan changes

## Label Updates (User Request - Feb 7)
- [x] Update Fill Mode label: "Single Card" → "Single Card (several of the same card to one page)"
- [x] Update multi-image mode label: "Multiple Cards" → "Multiple Cards (several varieties of cards on one page)"

## Slot Editing Preview (User Request - Feb 7)
- [x] Add editing mode: clicking a slot shows a live preview thumbnail beside zoom/pan controls
- [x] Live preview reflects zoom/pan changes in real-time
- [x] Save button applies changes to the sticker sheet and dismisses the preview
- [x] Cancel button discards changes and dismisses the preview
- [x] Sticker sheet canvas only updates after Save (not during editing)
- [x] Editing mode for fill mode (single card) and multi-image mode (per-slot)
- [x] Clickable slot grid thumbnails to open editing mode directly
- [x] Hover overlay with zoom icon on assigned slots in multi-image mode

## Navigation Rename (User Request - Feb 7)
- [x] Rename "Print Layout" to "Print Cards" in sidebar navigation
- [x] Rename "Sticker Creator" to "Create/Print Stickers" in sidebar navigation
- [x] Update page titles to match new names
- [x] Update Gallery page "Print Layout" button to "Print Cards"
- [x] Update CardBackDesigner "Apply to Print Layout" to "Apply to Print Cards"

## Non-Sports Creations (User Request - Feb 7)
- [x] Create NonSportsCreate page mirroring the Create page flow
- [x] Add "Non-Sports Creations" nav item in sidebar with Palette icon
- [x] Add non-sports trending topic discovery (pop culture, fantasy, sci-fi, nature, mythology, horror, anime, historical, abstract)
- [x] Support free-form custom topic input (e.g. "bigfoot running in the woods")
- [x] Include prompt enhancer option same as sports Create page
- [x] Use same image generation flow (model selection, multi-model compare, variance, progress tracking)
- [x] Save generated images to gallery same as sports cards
- [x] Add route in App.tsx for /non-sports
- [x] Backend: nonSportsTrending.discover route with LLM-powered topic discovery
- [x] Backend: nonSportsPrompts.generate route for open-ended prompt generation
- [x] Category filter buttons for all 9 non-sports categories
- [x] Art style selector (realistic, dynamic, vintage, modern, artistic, action)
- [x] Prompt history integration
- [x] Image editor, watermark, and export dialog integration

## Vault Landing Page (User Request - Feb 7)
- [x] Create VaultLock component with combination dial UI
- [x] Implement number pad input matching vault safe style (password: 02141971)
- [x] Add combination dial rotation animation when entering numbers
- [x] Add mechanical/squeaky old safe sound effects on dial turn (Web Audio API)
- [x] Add unlock animation with vault door opening (split door panels)
- [x] Show "Welcome to the Creation Vault" text with logo reveal
- [x] Gate the entire site behind the vault password
- [x] Store unlock state in sessionStorage so user doesn't re-enter on refresh
- [x] Integrate vault gate into App.tsx flow
- [x] SVG combination dial with 60 tick marks and numbered positions
- [x] Alternating clockwise/counter-clockwise dial rotation per digit
- [x] 8-bolt indicators around dial that light up on unlock
- [x] Vault handle with shake and rotation animation
- [x] Error buzz sound and shake animation for wrong code
- [x] Clear button (C) to reset entered digits
- [x] Purple gradient theme matching app aesthetic

## Vault Page Improvements (User Request - Feb 7)
- [x] Fix vault page scrolling - everything must fit in viewport without scrolling
- [x] Add animated floating gears in the background for immersion (12 gears with varying sizes, speeds, and opacity)
- [x] Change title to "Welcome to the Creation Vault"
- [x] Modernize the combination dial design (gradient accents, concentric ring hub, refined tick marks)
- [x] Added keyboard support (type numbers directly on keyboard)
- [x] Added subtle grid texture overlay on background
- [x] Added purple ambient glow behind dial
- [x] Compact layout with flex column centering to prevent overflow

## Vault Page Fix (User Report - Feb 7)
- [x] Fix vault page still not fitting on screen - used h-dvh with overflow-hidden, scaled down all elements
- [x] Ensure keyboard number input actually works - fixed stale closure with useRef pattern
- [x] Responsive sizing: dial scales with viewport, number pad buttons use compact sizing
- [x] Digit display uses responsive sizing to fit all 8 slots

## Vault Celebration Animation (User Request - Feb 7)
- [x] Add confetti burst animation on successful vault unlock (80 confetti pieces with random colors, sizes, rotation)
- [x] Add sparkling particle effects during celebration (40 sparkles with star shapes and glow)
- [x] Integrate celebration into the unlock sequence (fires during opening + welcome phases)
- [x] Added triumphant ascending chime sound effect via Web Audio API
- [x] Confetti uses physics-based animation with gravity, drift, and spin
- [x] Sparkles pulse and fade with random trajectories
- [x] CelebrationEffect component with canvas-based rendering for smooth performance

## Vault Door 3D Perspective (User Request - Feb 7)
- [x] Add CSS 3D perspective transforms to vault door opening animation (1200px perspective)
- [x] Left door panel swings open with rotateY hinge effect from left edge (transform-origin: left)
- [x] Right door panel swings open with rotateY hinge effect from right edge (transform-origin: right)
- [x] Add depth shadow and lighting effects during door swing (metallic gradient, rivets, inner shadow)
- [x] Smooth easing for realistic heavy door feel (cubic-bezier easing)
- [x] Added vault handle with 3D rotation on unlock
- [x] Added metallic texture with gradient overlays on door panels
- [x] Added rivet details on door panels for realism
- [x] Added center seam line between door panels
- [x] Added bright light reveal behind opening doors

## Vault Dust Particle Effect (User Request - Feb 7)
- [x] Add dust particles falling from door hinges during vault door opening (12-18 particles per hinge)
- [x] Particles emanate from 6 hinge positions (3 left, 3 right at 20%, 50%, 80%)
- [x] DOM-based rendering with Framer Motion for smooth animation
- [x] Particles have gravity (fall distance), drift, scale, and fade-out effects
- [x] Added center seam dust puff (30 particles) that burst outward when doors separate
- [x] Added dust cloud puffs at each hinge position with radial gradient blur
- [x] Earthy brown/tan color palette for realistic dust appearance
- [x] HingeDust component with z-index above doors, pointer-events-none
