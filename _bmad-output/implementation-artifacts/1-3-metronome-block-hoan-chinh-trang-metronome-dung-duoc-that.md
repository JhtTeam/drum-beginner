# Story 1.3: MetronomeBlock hoàn chỉnh — trang metronome dùng được thật

Status: review

## Story

As a người tự học trống,
I want điều khiển metronome trực quan từ xa 2 mét: số BPM khổng lồ, chấm nhịp sáng theo tick, chỉnh nhanh bằng nút hoặc phím tắt,
so that buổi luyện nhịp 60–80 bpm thoải mái như dùng app chuyên dụng.

## Acceptance Criteria

1. **MetronomeBlock render đủ theo UX-DR4**
   **Given** component `ui/MetronomeBlock` (AR-8) compose trong `features/metronome`
   **When** trang `/metronome` render
   **Then** hiển thị: BPM 96px amber tabular-nums + nhãn "bpm", hàng beat dots (phách 1 to 1.4×, dot active chuyển amber-bright + glow), nút −5/−1/■·▶/+1/+5/Tap tempo, chọn số phách 2/4·3/4·4/4, hint phím tắt dạng `kbd` (UX-DR4)
   **And** dải tempo giới hạn 40–200; số BPM đổi không làm layout nhảy (tabular-nums).

2. **Beat dots đồng bộ audio ≤50ms + reduced-motion**
   **Given** metronome đang chạy
   **When** quan sát beat dots
   **Then** dot active đổi đúng theo beat event của engine (audio là nguồn chân lý, lệch cảm nhận ≤50ms — UX-DR13)
   **And** khi `prefers-reduced-motion`: dot chỉ đổi màu, không scale/glow động (UX-DR2).

3. **Phím tắt một chủ duy nhất, không double-fire**
   **Given** focus không nằm trong input/button khác
   **When** nhấn Space / ↑ / ↓ / Shift+↑ / Shift+↓ / T
   **Then** start-stop / +1 / −1 / +5 / −5 / tap tempo tương ứng — đăng ký duy nhất qua hook `useMetronomeShortcuts` trong MetronomeBlock (AR-8)
   **And** khi focus ở button khác, Space không toggle metronome (không double-fire)
   **And** mọi thao tác đều làm được bằng nút bấm trên mobile (không có bàn phím).

## Tasks / Subtasks

- [x] Task 1: Logic phím tắt thuần + unit test (AC: #3) — red-green: viết test đỏ trước
  - [x] `src/ui/metronome-shortcuts.ts` (module thuần, KHÔNG React, KHÔNG DOM type): `type ShortcutAction = 'toggle' | 'tempo+1' | 'tempo-1' | 'tempo+5' | 'tempo-5' | 'tap'` + hàm thuần `resolveShortcutAction(input: { key: string; shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean; repeat: boolean; isInteractiveTarget: boolean }): ShortcutAction | null`
  - [x] Quy tắc resolve: trả `null` nếu `isInteractiveTarget` (AC-3 không double-fire) hoặc có ctrl/meta/alt (không cướp Cmd+T, Ctrl+T của trình duyệt). `' '` → toggle; `ArrowUp`/`ArrowDown` → ±1, kèm shift → ±5; `t`/`T` → tap. `repeat` (giữ phím): CHO PHÉP với 4 action tempo (giữ ↑ để dò tempo nhanh), CHẶN với toggle và tap (Space giữ = bật/tắt liên hồi, tap repeat phá trung bình tap)
  - [x] `src/ui/metronome-shortcuts.test.ts` (vitest env node, không DOM): đủ 6 phím ra đúng action; Space+shift vẫn toggle; isInteractiveTarget chặn tất cả; ctrl/meta/alt chặn; repeat chặn toggle/tap nhưng cho tempo; phím lạ → null
- [x] Task 2: Hook `useMetronomeShortcuts` (AC: #3)
  - [x] `src/ui/useMetronomeShortcuts.ts`: `useEffect` đăng ký MỘT listener `keydown` trên `window`, cleanup remove. Tính `isInteractiveTarget` từ `event.target`: tagName ∈ {INPUT, TEXTAREA, SELECT, BUTTON, A} hoặc `isContentEditable` — rồi gọi `resolveShortcutAction`
  - [x] Action resolve được → `event.preventDefault()` (Space cuộn trang, ↑↓ cuộn trang) rồi dispatch: toggle → `isRunning ? metronome.stop() : metronome.start()`; tempo±n → `metronome.setTempo(tempo ± n)` (engine tự clamp 40–200); tap → `metronome.tap()`
  - [x] Chống stale closure: trong handler ĐỌC `metronome.getSnapshot()` trực tiếp (không capture tempo/isRunning từ render), effect đăng ký MỘT lần deps `[]` — không re-register listener mỗi lần snapshot đổi
  - [x] Hook này là NƠI DUY NHẤT addEventListener cho Space/↑/↓/T trong toàn codebase (AD-8) — chỉ được gọi bên trong MetronomeBlock
- [x] Task 3: `ui/MetronomeBlock` — component + CSS module (AC: #1, #2)
  - [x] `src/ui/MetronomeBlock.tsx`: đọc state qua `useMetronome()` (hook có sẵn), gọi engine singleton từ `core/audio`. Không props ở story này (AD-8 mount-cùng-bài-tập là story 2.4 — đừng dựng trước)
  - [x] BPM display: số tempo + nhãn "bpm" nhỏ `--color-text-secondary` cạnh baseline; font dùng role token `--font-size-display-bpm`/`--font-weight-display-bpm`/`--letter-spacing-display-bpm`, màu `--bpm-display-color`, `font-variant-numeric: tabular-nums`, `line-height: 1`; reserve bề ngang (vd `min-width: 3ch`, căn giữa) để 60 → 200 không xô layout (AC-1)
  - [x] Beat dots: render `beatsPerBar` dot từ snapshot (2/3/4 dot); dot size `--beat-dot-size`, radius `--beat-dot-radius`, inactive `--beat-dot-inactive-color`; dot 1 (accent) scale 1.4 (`--beat-dot-accent-scale`) KỂ CẢ khi không active; dot active nền `--beat-dot-active-color` + glow `box-shadow: 0 0 16px` amber mờ (giá trị một-chỗ-dùng, DESIGN.md cho phép raw — ngoại lệ elevation hợp thức). Hàng dots `aria-hidden="true"` (thuần trang trí nhịp — thao tác đã có nút)
  - [x] Transport: hàng nút `−5 · −1 · [▶ Bắt đầu / ■ Dừng] · +1 · +5` + nút `Tap tempo`. Toggle là button-primary duy nhất màn hình (token `--button-primary-*`, min-width cố định chống nhảy layout — nếp 1.2); các nút còn lại button-secondary. Nút ± thêm `aria-label` ("Giảm 5 bpm", "Tăng 1 bpm"…); mọi nút ≥44px (global.css đã set min) — AC-3 mobile
  - [x] Chọn số phách: 3 nút `2/4 · 3/4 · 4/4` (segmented, button-secondary + trạng thái active bằng token amber) với `aria-pressed`; click → `metronome.setBeatsPerBar(2|3|4)`; mặc định 4/4 phản ánh từ snapshot
  - [x] Hint phím tắt: `<kbd>Space</kbd> bắt đầu/dừng · <kbd>↑</kbd><kbd>↓</kbd> ±1 · <kbd>Shift+↑↓</kbd> ±5 · <kbd>T</kbd> tap tempo` — style kbd theo mock (nền `--color-surface-overlay`, viền `--color-border-subtle`, radius `--rounded-sm`, chữ 12px≈`--font-size-small`); được phép ẩn hàng hint ở <768px (mobile không bàn phím — không phải yêu cầu, là polish hợp lý)
  - [x] `src/ui/MetronomeBlock.module.css`: mọi giá trị đã có token dùng `var(...)` (AD-5); KHÔNG media query breakpoint riêng ngoài 768px; KHÔNG hex/px trần cho thứ đã có token
- [x] Task 4: Đồng bộ visual theo beat event — bù audioTime (AC: #2)
  - [x] Trong MetronomeBlock: `useEffect` subscribe `metronome.onBeat(event => ...)`, cleanup unsubscribe. Beat event phát tại thời điểm SCHEDULE — sớm hơn âm thật tối đa ~100ms (caveat ghi sẵn từ story 1.2). Bù: `delayMs = Math.max(0, (event.audioTime - metronome.currentTime) * 1000)` rồi `setTimeout(() => setActiveBeat(event.beatInBar), delayMs)` — dot đổi đúng lúc âm vang (≤50ms cảm nhận)
  - [x] MỘT pending timer duy nhất (ref): event mới đến khi timer cũ chưa bắn → clearTimeout thay thế. Đây chính là chống dồn frame UX-DR13: tab ẩn setTimeout bị throttle, event mới liên tục thay event cũ, tab hiện lại visual bắt kịp trong ≤1 beat, không replay
  - [x] `isRunning` chuyển false (snapshot) → clear timer + `setActiveBeat(null)` (không dot nào sáng khi đứng yên); unmount → unsubscribe + clear timer nhưng KHÔNG stop engine (state xuyên route — AD-3, nếp 1.2)
  - [x] Đổi beatsPerBar khi đang chạy: render từ snapshot, active index có thể > số dot trong ≤1 beat — render guard (dot active chỉ khi `index === activeBeat`) là đủ, engine wrap ở beat kế (đã có test engine)
  - [x] CẤM: requestAnimationFrame loop, CSS animation tự chạy theo tempo, UI tự đếm tick — visual CHỈ từ beat event (AD-3)
- [x] Task 5: Reduced-motion cho beat dot (AC: #2)
  - [x] Scale/glow của dot active đặt trong `@media (prefers-reduced-motion: no-preference)` NGAY TRONG `MetronomeBlock.module.css`; ngoài media query dot active chỉ đổi màu. Đây là ngoại lệ có chủ đích của convention "global.css chủ reduced-motion" — xem Dev Notes "Reduced-motion: xung đột đã giải"
- [x] Task 6: Compose vào trang `/metronome` (AC: #1)
  - [x] `src/features/metronome/MetronomePage.tsx` (UPDATE): thay toàn bộ UI tối giản 1.2 (nút start/stop + input tempo draft) bằng `<h1>Metronome</h1>` + `<MetronomeBlock />` căn giữa — input số tempo BỎ HẲN (UX-DR4 không có input; tap + ±5 phủ nhu cầu). Giữ export name `MetronomePage` (App.tsx import theo tên)
  - [x] `src/features/metronome/MetronomePage.module.css` (UPDATE): thay style controls cũ bằng layout trang — block căn giữa, thoáng (trang metronome độc lập "toàn màn hình" — EXPERIENCE IA); KHÔNG cần cụm ghim đáy mobile (UX-DR12 là spec của trang luyện tập 2.4)
- [x] Task 7: Quality gate + verify thủ công + dọn deferred (AC: #1, #2, #3)
  - [x] `npm run check` xanh (tsc -b + oxlint src + vitest run + vite build); 32 test cũ (24 engine + routes) vẫn xanh — KHÔNG sửa file `core/`
  - [ ] Verify tay trên `vite dev`: (a) BPM 96 amber, đổi 60→200 không xô layout; (b) chạy → dot sáng khớp tiếng tick nghe-nhìn đồng thời, phách 1 dot to hơn + tiếng cao hơn; (c) đủ 6 phím tắt; (d) click nút toggle bằng chuột rồi nhấn Space → chỉ MỘT lần toggle (focus ở button → hook nhường native click); (e) Tab qua các nút → focus ring amber hiện rõ; (f) đổi 3/4 khi đang chạy → 3 dot, không lệch nhịp; (g) DevTools emulate `prefers-reduced-motion: reduce` → dot chỉ đổi màu; (h) ẩn tab 60s → quay lại dot bắt kịp ngay; (i) mobile 375px: mọi thao tác bằng nút, target ≥44px; (j) đang chạy điều hướng `/lo-trinh` rồi quay lại → UI phản ánh đúng state engine
  - [x] Cập nhật `deferred-work.md`: xóa/đánh dấu xong mục "composite token bpm-display" (giải quyết bằng tiêu thụ role token — xem Dev Notes); mục skip-link GIỮ NGUYÊN deferred (trang này 10± tab stop, bàn phím đủ dùng, chưa có flow dài)
  - [ ] Push + verify production Vercel deploy xanh

## Dev Notes

### Điều BẮT BUỘC — architecture guardrails cho story này

- **AD-8/AR-8 (binding, lý do tồn tại của story):** MỘT component `ui/MetronomeBlock` duy nhất (transport, ±1/±5, tap, chọn số phách, BPM display, beat dots) — `features/metronome` compose bây giờ, `features/practice` compose ở story 2.4. Phím tắt đăng ký ở MỘT hook `useMetronomeShortcuts` bên trong MetronomeBlock; hook bỏ qua event khi focus ở phần tử tương tác khác; NGOÀI hook này không nơi nào addEventListener cho Space/↑↓/T. [Source: planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-8]
- **AD-1 layering:** MetronomeBlock sống ở `ui/` (không phải `features/metronome`) vì 2.4 dùng lại mà features cấm import nhau. `ui/` được import `core/` — dùng singleton `metronome` + `useMetronome()` trực tiếp. [Source: ARCHITECTURE-SPINE.md#AD-1]
- **AD-3:** UI KHÔNG tự đếm tick — mọi vị trí beat từ payload `{bar, beatInBar, audioTime}`. Âm thanh là nguồn chân lý, visual đuổi theo ≤50ms. Rời trang không stop engine (state xuyên route); `pagehide` đã lo ở `core/audio/index.ts`. [Source: ARCHITECTURE-SPINE.md#AD-3]
- **AD-5:** chỉ `var(--token)`; token cần thiết ĐÃ CÓ SẴN đủ trong `tokens.css` (xem "Token map" dưới) — story này KHÔNG cần sửa `tokens.css`, KHÔNG thêm token mới. [Source: src/styles/tokens.css; ARCHITECTURE-SPINE.md#AD-5]
- **Không dependency mới:** không cài gì. `@testing-library/react` VẪN deferred — test story này là logic thuần node (xem Testing). `package.json` không đổi.

### Engine API có sẵn (story 1.2 — dùng, không sửa)

`import { metronome, TEMPO_MIN, TEMPO_MAX } from '../core/audio'` — public entry, không import sâu `metronome-engine.ts`:

- `metronome.start()` / `stop()` — start tự lo lazy AudioContext + resume; stop giữ tempo/beatsPerBar
- `metronome.setTempo(bpm)` — tự clamp 40–200 + round; `setBeatsPerBar(2|3|4)` — có runtime guard
- `metronome.tap()` — trung bình ≤5 tap, reset sau 2s im, KHÔNG tự start engine (tap khi đứng yên chỉ đổi số BPM — hành vi đúng)
- `metronome.onBeat(listener)` → unsubscribe fn; payload `{bar, beatInBar, audioTime}`, beatInBar đếm TỪ 1; listener throw đã được engine nuốt
- `metronome.currentTime` — getter audio clock, chính là thứ để bù delay visual (làm sẵn cho story này từ 1.2)
- `useMetronome()` từ `src/ui/useMetronome.ts` (có sẵn) → snapshot `{tempo, beatsPerBar, isRunning}` cached bất biến

**KHÔNG chạm bất kỳ file nào trong `src/core/`** — engine xong, 24 test đang xanh. Nếu tưởng cần sửa engine thì đọc lại spec — mọi nhu cầu của story này đã có API.

### Đồng bộ visual — spec đã chốt từ 1.2, chỉ việc làm theo

Beat event phát tại thời điểm *schedule*, sớm hơn âm thật tối đa ~100ms (lookahead). Không bù → dot nhảy trước tiếng ~100ms, vượt ngân sách 50ms. Công thức: `delayMs = max(0, (event.audioTime - metronome.currentTime) * 1000)` rồi setTimeout đổi active dot. Một pending timer duy nhất, event mới clearTimeout event cũ — vừa đúng semantics "không dồn frame khi tab ẩn" (UX-DR13) vừa khỏi quản lý mảng timer. Ở 40–200 bpm khoảng beat 300–1500ms > lookahead 100ms nên bình thường không bao giờ có 2 timer chồng; chồng chỉ xảy ra ở catch-up burst — thay thế (bỏ dot trung gian) là hành vi ĐÚNG. [Source: implementation-artifacts/1-2-*.md#Dev-Notes "Beat event timing caveat"; EXPERIENCE.md#Đồng-bộ-âm-thanh]

### Reduced-motion: xung đột đã giải (đọc trước khi viết CSS dot)

Ba nguồn giao nhau:

1. Convention spine: "`styles/global.css` là chủ duy nhất của `prefers-reduced-motion` (reduced-motion: beat đổi màu, không scale/nảy)".
2. `global.css` hiện tại chỉ ép `animation/transition-duration: 0.01ms` — KHÔNG gỡ được `transform: scale` + `box-shadow` tĩnh gắn theo class active.
3. reconcile-ux GAP-3 (nguồn gốc của convention đó) nói rõ: "biến thể reduced-motion phải được hiện thực MỘT LẦN ở component beat/pattern DÙNG CHUNG, không phải per-page".

**Quyết định:** scale + glow của dot active bọc trong `@media (prefers-reduced-motion: no-preference)` trong `MetronomeBlock.module.css` — đổi màu nằm ngoài, luôn chạy. Đúng tinh thần "một lần ở component dùng chung" (MetronomeBlock là component đó); global.css vẫn là chủ cơ chế toàn cục, đây là biến thể state của riêng component chuyển động. KHÔNG lặp pattern này ở component khác không-chuyển-động. [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions hàng Accessibility; reconcile-ux.md#GAP-3; src/styles/global.css]

### Token map — dùng đúng các token này (tất cả ĐÃ TỒN TẠI trong tokens.css)

| Phần tử | Token |
| --- | --- |
| Số BPM | `--font-size-display-bpm` 96px, `--font-weight-display-bpm` 700, `--letter-spacing-display-bpm`, `--bpm-display-color` (amber) + `font-variant-numeric: tabular-nums` |
| Nhãn "bpm" | `--color-text-secondary`, cỡ ~20px theo mock — không có token riêng, dùng `--font-size-h2`/24px hoặc raw 20px là MỘT chỗ dùng (mock dùng 20px; chọn một, nhất quán) |
| Beat dot | `--beat-dot-size` 20px, `--beat-dot-inactive-color`, `--beat-dot-active-color`, `--beat-dot-accent-scale` 1.4, `--beat-dot-radius` |
| Glow dot active | `box-shadow: 0 0 16px` + amber mờ — raw hợp lệ (DESIGN.md prose, một chỗ dùng, ngoại lệ elevation chủ đích) |
| Nút toggle | `--button-primary-*` (nền amber, chữ `--color-text-on-amber`, hover bright, height 44px) |
| Nút ±/Tap/số phách | `--button-secondary-*` (transparent, viền subtle, chữ primary, 44px) |
| kbd hint | `--color-surface-overlay`, `--color-border-subtle`, `--rounded-sm`, chữ `--font-size-small`/`--color-text-secondary` |
| Khoảng cách | thang `--spacing-*` |

Composite token `bpm-display.typography` trong DESIGN.md chưa map thành custom property riêng (deferred từ 1.1) — role tokens ở trên là đủ giá trị, tiêu thụ chúng là ĐÓNG mục deferred đó, không tạo token composite mới. [Source: implementation-artifacts/deferred-work.md; src/styles/tokens.css]

### Layout & hành vi UI

- Mock tham chiếu bố cục cụm BPM/controls/kbd: `planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/mockups/mock-bai-hoc-luyen-tap.html` (dòng 85–103, 159–170) — mock là trang luyện tập; trang `/metronome` là spine-only, lấy đúng phần khối metronome, bỏ pattern/target/ghi-tempo (đồ của 2.4/3.3). DESIGN.md thắng nếu mock mâu thuẫn.
- Trang metronome: block căn giữa trang, ít yếu tố ("metronome độc lập toàn màn hình" — EXPERIENCE IA #4; "cái gì đang sống phải sáng nhất" — DESIGN Brand). Không sidebar, không card bọc bắt buộc.
- Thứ tự dọc gợi ý theo mock: beat dots → BPM+nhãn → hàng nút transport → chọn số phách → Tap (hoặc Tap cùng hàng transport như AC liệt kê) → hint kbd. AC chỉ ràng buộc THÀNH PHẦN, không ràng buộc thứ tự từng dòng.
- Đổi tempo khi đang chạy hiệu lực từ nhịp kế tiếp — engine lo rồi, UI không làm gì thêm (UX-DR4 câu cuối là mô tả hành vi engine).
- Dừng: không dot nào active; dots vẫn hiển thị (hàng dot render theo beatsPerBar từ snapshot, kể cả khi idle).
- Focus ring, touch target, contrast: global.css + token đã lo — đừng override outline trong module CSS.

### Phạm vi — KHÔNG làm trong story này

- KHÔNG `ui/PatternGrid`, tempo mục tiêu, "Ghi tempo tốt nhất", mount-tempo-theo-bài-tập (props initialTempo…) — story 2.4/3.3. MetronomeBlock story này KHÔNG props.
- KHÔNG persist tempo/beatsPerBar vào localStorage (progress store là 3.1, không chứa setting metronome).
- KHÔNG subdivision, per-beat accent (PRD A5 — GĐ2).
- KHÔNG sửa `core/audio/*`, `app/routes.ts`, `App.tsx`, `AppLayout.*`, `tokens.css`, `global.css`.
- KHÔNG skip-link/focus-management route change (vẫn deferred — deferred-work.md).
- KHÔNG master gain stage (deferred cho 2.3).
- KHÔNG cài `@testing-library/react` hay dependency nào.

### Testing

- Vitest 4.1.x env `node` (vite.config.ts) — KHÔNG DOM. Test được của story này là logic thuần: `resolveShortcutAction` (Task 1). Hook/component KHÔNG unit test ở story này (testing-library vẫn deferred; logic quyết định đã rút hết ra hàm thuần — đúng bài DI của 1.2).
- Red-green như nếp 1.1/1.2: viết `metronome-shortcuts.test.ts` đỏ trước khi viết resolver.
- Bù delay visual (`max(0, (audioTime - currentTime) * 1000)`) đơn giản đủ mức không cần tách test; nếu tách helper thuần thì đặt trong `metronome-shortcuts.ts`… KHÔNG — đặt file riêng hoặc inline trong component; đừng nhét vào module shortcuts (single-purpose).
- AC-2 (≤50ms) và tab-ẩn verify bằng tay (Task 7) — không đo tự động ở story này.
- `npm run check` là quality gate cuối — cả 4 bước phải xanh, Vercel build dùng đúng script này.

### Previous story intelligence (1.2 — done, 8 review patch đã áp)

- Nếp đã thiết lập PHẢI theo: red-green; CSS module cạnh component (`PascalCase.module.css`); mọi giá trị style qua `var()`; UI text tiếng Việt inline; min-width nút toggle chống nhảy layout (patch review 1.2 — giữ nguyên chiêu này trong MetronomeBlock).
- Review 1.2 dạy: guard sớm các edge (listener throw, focus target, key repeat) thay vì chờ review; side effect cấp module phải guard `typeof window` — hook story này đăng ký listener trong `useEffect` nên tự an toàn.
- `MetronomePage.tsx` hiện tại (58 dòng): toggle + input tempo draft-commit. Cụm draft-commit input SẼ BỊ XÓA cùng input (UX-DR4 không có input số) — đừng tiếc code, tap + ±5 phủ nhu cầu nhập tempo, còn cần thì user tap 2 phát.
- Cấu trúc hiện có tái dùng: `src/ui/useMetronome.ts` (đã đặt sẵn ở ui/ từ 1.2 CHÍNH LÀ để MetronomeBlock dùng — đừng viết hook subscribe mới).
- Git gần nhất: `2ede501` feat engine 1.2; pattern commit `feat(metronome): story 1.x — mô tả`.

### Project Structure Notes

- Cây đích story này:

  ```text
  src/ui/
    MetronomeBlock.tsx           # NEW — block dùng chung (AD-8)
    MetronomeBlock.module.css    # NEW — token-only, reduced-motion variant cho dot
    useMetronomeShortcuts.ts     # NEW — hook keydown duy nhất (AD-8)
    metronome-shortcuts.ts       # NEW — resolver thuần, test được env node
    metronome-shortcuts.test.ts  # NEW — unit tests (Task 1)
    useMetronome.ts              # (có sẵn — tái dùng, không sửa)
  src/features/metronome/
    MetronomePage.tsx            # UPDATE — thay UI 1.2 bằng <MetronomeBlock />
    MetronomePage.module.css     # UPDATE — layout trang căn giữa
  ```

- Naming theo Conventions: component `PascalCase.tsx`, hook `useX.ts`, module thuần `kebab-case.ts`, CSS module cạnh component.
- Import: MetronomeBlock/hook chỉ import từ `../core/audio` (public entry) — không import sâu; features import `../../ui/MetronomeBlock`.
- Vitest include `src/**/*.test.{ts,tsx}` đã cover file test mới — không sửa config.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.3] — story + AC gốc; UX-DR4, UX-DR13, UX-DR2
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-8] — MetronomeBlock duy nhất ở ui/, một chủ phím tắt useMetronomeShortcuts
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-3, #AD-1, #AD-5] — UI không tự đếm tick, layering, token-only
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/reconcile-ux.md#GAP-1, #GAP-3] — vì sao block phải ở ui/; reduced-motion hiện thực một lần ở component dùng chung
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md#Components] — bpm-display, beat-dot (accent 1.4×, glow ngoại lệ elevation), tabular-nums, Do's & Don'ts
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md#Interaction-Primitives, #Accessibility-Floor, #Đồng-bộ-âm-thanh] — 6 phím tắt, không cướp phím ở input, ≤50ms, reduced-motion giữ đổi màu
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/mockups/mock-bai-hoc-luyen-tap.html] — bố cục cụm BPM/controls/kbd tham chiếu
- [Source: _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/prd.md#FR-7..FR-10] — 40–200 mặc định 60, ±1/±5, tap, 2/4·3/4·4/4
- [Source: _bmad-output/implementation-artifacts/1-2-metronome-engine-nghe-duoc-nhip-chuan.md] — engine API, beat event caveat ~100ms, currentTime getter, nếp code + review learnings
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — composite token bpm-display (đóng ở story này), skip-link (giữ deferred)
- [Source: src/core/audio/index.ts; src/ui/useMetronome.ts; src/features/metronome/MetronomePage.tsx] — hiện trạng code UPDATE/tái dùng

## Dev Agent Record

### Agent Model Used

claude-fable-5 (bmad-dev-auto unattended run, 2026-07-08)

### Debug Log References

### Completion Notes List

- Red-green TDD: 28 resolver tests written first (failed on missing module), then implemented to green; suite now 60/60.
- Adversarial review pass: 4 patches applied (touch/select hardening on rapid-click buttons, glyph aria-hidden on toggle, dots horizontal padding for 1.4x accent, glow via color-mix from token), 3 deferred to deferred-work.md, 6 rejected. No spec loopbacks.
- `npm run check` exit 0 (tsc -b, oxlint, vitest 60/60, vite build). `src/core/` untouched.
- Task 7 manual browser verify + push/Vercel verify remain human steps (unchecked above).
- Full record: spec-1-3-metronome-block-hoan-chinh-trang-metronome-dung-duoc-that.md (Auto Run Result).

### File List

- src/ui/metronome-shortcuts.ts (NEW)
- src/ui/metronome-shortcuts.test.ts (NEW)
- src/ui/useMetronomeShortcuts.ts (NEW)
- src/ui/MetronomeBlock.tsx (NEW)
- src/ui/MetronomeBlock.module.css (NEW)
- src/features/metronome/MetronomePage.tsx (UPDATE)
- src/features/metronome/MetronomePage.module.css (UPDATE)
- _bmad-output/implementation-artifacts/deferred-work.md (UPDATE)
