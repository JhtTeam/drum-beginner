---
title: 'Story 3.1 — Progress store + nút "Hoàn thành bài hôm nay"'
type: 'feature'
created: '2026-07-09'
status: 'done'
baseline_revision: 'd9f17c974914459dd860fa0862268ff4de8dfe56'
review_loop_iteration: 0
followup_review_recommended: false
final_revision: '698a9f3cb4e68022360ffa8007bb2012100ad514'
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Chưa có nơi lưu tiến độ học: người dùng không đánh dấu được "đã xong bài", không thấy checkmark còn nguyên sau khi đóng trình duyệt. Đây là nền móng cho cả Epic 3 (streak, trang chủ "Hôm nay", export/import).

**Approach:** Xây module thuần `core/progress/` sở hữu key localStorage `drum-beginner:progress:v1` (envelope có version + validator 3 trạng thái + store class DI + selectors thuần), một hook `ui/useProgress.ts`, rồi gắn nút "Hoàn thành bài hôm nay" ở LessonPage, checkmark ở RoadmapPage, và banner corrupt toàn cục. Toàn bộ giá trị dẫn xuất là selector trong core; UI chỉ gọi.

## Boundaries & Constraints

**Always:**
- `core/progress/` KHÔNG import `react`/`app`/`ui`/`features`/`content` (AD-1). Selectors nhận danh sách item lộ trình **qua tham số**; feature/hook lấy từ `content` rồi truyền vào.
- Một chủ sở hữu key `drum-beginner:progress:v1`; envelope đúng `{ schemaVersion: 1, completedLessons, bestTempos, sessions }`; khóa là `LessonItemId`.
- `ProgressStore` nhận `StorageLike = { getItem; setItem }` qua constructor (DI) — test env `node` KHÔNG có localStorage/jsdom, KHÔNG thêm dependency mới.
- Store KHÔNG throw xuyên tầng: trả `LoadResult`/`WriteResult` tường minh. Ngày lưu `toISOString()` (UTC); mọi so "cùng ngày"/streak quy về **ngày local** qua getter local, KHÔNG so chuỗi UTC.
- `sessions` chỉ append khi bấm "Hoàn thành bài hôm nay"; hoàn thành lại giữ timestamp lần đầu trong `completedLessons`. Corrupt → chỉ ghi đè khi user bấm "Bắt đầu lại".
- Component chỉ dùng token `var(...)` có sẵn (AD-5), link dùng `ROUTES`/`lessonPath()` (AD-6). `getSnapshot` trả tham chiếu ổn định (chỉ đổi khi mutation) cho `useSyncExternalStore`.
- `npm run check` (tsc -b + oxlint + vitest run + vite build) phải xanh.

**Block If:**
- Envelope/shape cần đổi khác `{schemaVersion:1, completedLessons, bestTempos, sessions}` → HALT (kéo theo migrate cả epic).
- Phải thêm dependency mới (jsdom/testing-library) để test → HALT.

**Never:**
- Không build UI ghi/hiển thị best tempo (story 3.3), thẻ "Hôm nay"/streak UI (3.2), UI import/export thật (3.4 — chỉ dòng gợi ý text + nút "Bắt đầu lại"), moment "Xong Tuần N 🎉" (3.2).
- Không viết test cho React component (không có harness — khoảng trống repo đã biết); test tập trung ở `core/progress`.
- Không sửa `content/`, `styles/tokens.css`, `styles/global.css`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Load empty | `getItem` → `null` | `{ status: 'empty' }`; store dùng `emptyEnvelope()` | none |
| Load ok | JSON shape đúng đủ | `{ status: 'ok', data }` | none |
| Load corrupt | JSON hỏng / thiếu trường / sai kiểu / `schemaVersion≠1` | `{ status: 'corrupt', raw }`; đọc dùng `emptyEnvelope()`, giữ `status='corrupt'` | không throw |
| `{schemaVersion:1}` đủ shape rỗng | `{schemaVersion:1,completedLessons:{},bestTempos:{},sessions:[]}` | `ok` | none |
| completeLesson lần đầu | id chưa có | `completedLessons[id]=nowIso`; `sessions` +1; persist; `{ok:true}`; emit | none |
| completeLesson lại | id đã có | timestamp cũ giữ nguyên; `sessions` vẫn +1; `{ok:true}` | none |
| Ghi thất bại | `setItem` throw (quota/mock) | snapshot in-memory rollback về trước mutation; `{ok:false, reason:'write-failed'}` | không throw |
| completeLesson khi corrupt | `status==='corrupt'` | KHÔNG ghi; `{ok:false, reason:'corrupt'}` | none |
| reset | bất kỳ | ghi đè `emptyEnvelope()`; persist + emit; `{ok:true}` | write-failed như trên |
| getStreak biên TZ | session UTC 23:00 & 01:00 | quy về ngày local rồi đếm distinct liên tiếp; hôm nay/hôm qua → còn sống, >1 ngày → 0 | none |
| getNextItem | completed + orderedIds | id chưa xong đầu tiên theo thứ tự; hết → `undefined` | none |
| getWeekProgress | completed + weekIds | `{ done, total: weekIds.length }` | none |

</intent-contract>

## Code Map

- `src/core/types.ts` -- `LessonItemId = string`, `LessonKind`; pattern discriminated-union để mirror cho `LoadResult`/`WriteResult`
- `src/core/audio/index.ts` -- pattern singleton module-scope + DI object + `if (typeof window !== 'undefined')` guard; nhân bản cho `core/progress/index.ts`
- `src/core/audio/sample-player.test.ts` -- pattern fake deps env node (`describe/it/expect` từ `vitest`, factory `createFake…` ghi lời gọi); mirror cho `createFakeStorage()`
- `src/ui/useMetronome.ts` -- mẫu 9 dòng `useSyncExternalStore(store.subscribe, store.getSnapshot)`; nhân bản cho `ui/useProgress.ts`
- `src/content/index.ts` -- `getPhases()`, `getWeeks(phaseId)`, `getItemById(id)`; ordered ids = `getPhases().flatMap(p=>p.weeks.flatMap(w=>w.items.map(i=>i.id)))`; week ids = `week.items.map(i=>i.id)`
- `src/features/lesson/LessonPage.tsx` -- `useParams().id` → `getItemById`; `!found` 404 branch giữ nguyên; marker "3.1 sẽ thêm link bài kế" ~dòng 84 sau section "Thực hành" = chỗ chèn nút hoàn thành
- `src/features/roadmap/RoadmapPage.tsx` -- card = `<Link className={styles.card}>` trong `week.items.map`; chèn checkmark keyed `item.id`; CSS `RoadmapPage.module.css`
- `src/app/AppLayout.tsx` -- `<main><Outlet/></main>`; mount banner ngay trước `<Outlet/>`
- `src/app/routes.ts` -- `ROUTES`, `lessonPath(id)`
- `src/styles/tokens.css` -- có sẵn `--color-success`, `--checklist-item-done-icon-color`, `--progress-bar-*`, `--card-*`, `--color-surface-*`; TÁI DÙNG, không thêm token
- `vite.config.ts` -- `test.environment: 'node'` (xác nhận cần DI storage)

## Tasks & Acceptance

**Execution:**
- [x] `src/core/progress/envelope.ts` -- định nghĩa `IsoDateTime`, `ProgressEnvelope`, `LoadResult` (union `empty|ok|corrupt`), `WriteResult` (union `{ok:true}|{ok:false;reason:'write-failed'|'corrupt'}`), `STORAGE_KEY`, `SCHEMA_VERSION`, `emptyEnvelope()`, `parseEnvelope(raw)` -- validate ĐẦY ĐỦ từng trường (mirror yêu cầu import 3.4), không throw
- [x] `src/core/progress/selectors.ts` -- `getStreak(sessions, now)`, `getNextItem(completedLessons, orderedItemIds)`, `getWeekProgress(completedLessons, weekItemIds)` -- hàm thuần, không import content, `now` truyền vào để test tất định
- [x] `src/core/progress/store.ts` -- class `ProgressStore(storage: StorageLike)`: load 1 lần qua `parseEnvelope`; `getSnapshot()` (ref ổn định), `subscribe(cb)`, `completeLesson(id, nowIso)`, `reset()`, `isCompleted(id)`; rollback khi `setItem` throw; corrupt → không ghi trừ `reset()`
- [x] `src/core/progress/index.ts` -- export singleton `progress = new ProgressStore(realStorage)` với guard `typeof window !== 'undefined'` (fallback in-memory khi không có window); re-export types/consts/selectors cho feature/ui
- [x] `src/core/progress/*.test.ts` -- unit test env node với `createFakeStorage()` (Map + cờ `failWrite`): `parseEnvelope` 5 nhánh, `getStreak` (rỗng/cùng ngày/liên tiếp/gãy/hôm qua/>1 ngày/biên TZ), `getNextItem`, `getWeekProgress`, `ProgressStore` (ghi/ghi lại/write-failed rollback/corrupt/reset/subscribe notify)
- [x] `src/ui/useProgress.ts` -- `useSyncExternalStore(progress.subscribe, progress.getSnapshot)`, mirror `useMetronome.ts`
- [x] `src/ui/ProgressCorruptBanner.tsx` (+ `.module.css`) -- đọc `useProgress()`; `status==='corrupt'` → cảnh báo + nút "Bắt đầu lại" (`progress.reset()`) + dòng gợi ý import backup (text trỏ /tien-do); khác → `null`; token-only, giọng không chê
- [x] `src/features/lesson/LessonPage.tsx` -- thêm section cuối (sau "Thực hành") nút primary "✓ Hoàn thành bài hôm nay" cho mọi item; onClick `progress.completeLesson(item.id, new Date().toISOString())`; `ok`→gợi ý bài kế (`getNextItem`+`lessonPath`, KHÔNG auto-navigate) + toast/nút "Đã hoàn thành ✓" vẫn bấm lại được; `write-failed`→toast `role="status"` "Chưa lưu được — thử lại"; `corrupt`→dựa banner toàn cục
- [x] `src/app/AppLayout.tsx` -- mount `<ProgressCorruptBanner/>` ngay trước `<Outlet/>`, giữ nguyên nav

**Acceptance Criteria:**
- Given trang bài học, when bấm "✓ Hoàn thành bài hôm nay", then `completedLessons[id]` = timestamp ISO (lần đầu), `sessions` +1, checkmark success hiện trên card lộ trình, gợi ý bài kế tiếp mà KHÔNG auto-navigate; reload trình duyệt trạng thái còn nguyên.
- Given localStorage ghi thất bại, when bấm Hoàn thành, then UI giữ nguyên state, toast nhẹ "Chưa lưu được — thử lại", nút bấm lại được.
- Given localStorage corrupt khi mở app, when render bất kỳ trang, then banner cảnh báo + nút "Bắt đầu lại" (chỉ ghi đè khi bấm) + gợi ý import backup; `completeLesson` trả `{ok:false,reason:'corrupt'}` không ghi.
- Given `vitest run`, when chạy, then test xanh cho `parseEnvelope` (3+2 trạng thái), `getStreak` (kể cả biên TZ), `getNextItem`, `getWeekProgress`, và `ProgressStore` (ghi/rollback/corrupt/reset/subscribe).
- Given `npm run check`, when chạy, then tsc + oxlint + vitest + build đều xanh.

## Spec Change Log

_(Chưa có — không có loopback bad_spec.)_

## Review Triage Log

### 2026-07-09 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 1, low 1)
- defer: 3: (high 0, medium 1, low 2)
- reject: 9
- addressed_findings:
  - `[medium]` `[patch]` Truy cập `window.localStorage` không bọc try/catch có thể throw (storage bị tắt/iframe sandbox) làm trắng màn app → thêm `resolveStorage()` bọc try/catch, fallback in-memory (`core/progress/index.ts`)
  - `[low]` `[patch]` Membership test dùng `in` dò prototype chain (id trùng `Object.prototype` báo hoàn thành sai) → chuyển sang `Object.hasOwn` ở `store.ts`/`selectors.ts`/`LessonPage.tsx`/`RoadmapPage.tsx`

## Design Notes

**getStreak (điểm dễ sai nhất):** chuẩn hóa mỗi ISO → khóa ngày local `YYYY-MM-DD` bằng `getFullYear/getMonth/getDate` của `new Date(iso)`, gom `Set` ngày distinct. Streak = số ngày liên tiếp lùi từ mốc: chứa "hôm nay" → đếm từ hôm nay; không nhưng chứa "hôm qua" → từ hôm qua (chưa đứt); ngày gần nhất >1 ngày → 0. `now: Date` truyền vào (không gọi `new Date()` bên trong) để tất định.

**Store snapshot ổn định:** giữ object `{ status, data }`; chỉ tạo object mới khi mutation thành công rồi emit — bắt buộc cho `useSyncExternalStore`. Corrupt: đọc dùng `emptyEnvelope()` nhưng giữ `status='corrupt'` để banner phản ứng; `completeLesson` chặn ghi khi corrupt.

**Singleton guard (mirror `core/audio/index.ts`):**
```ts
const realStorage: StorageLike =
  typeof window !== 'undefined'
    ? window.localStorage
    : createMemoryStorage()
export const progress = new ProgressStore(realStorage)
```

## Verification

**Commands:**
- `npm run check` -- expected: tsc -b + oxlint src + vitest run + vite build đều pass (build đỏ nếu test đỏ)
- `npm test` -- expected: toàn bộ suite `core/progress/*.test.ts` xanh

**Manual checks:**
- `npm run dev` → mở một bài học, bấm "✓ Hoàn thành bài hôm nay" → card lộ trình hiện checkmark, gợi ý bài kế xuất hiện, không tự chuyển trang; reload → checkmark còn nguyên.
- DevTools set `localStorage['drum-beginner:progress:v1']='{bad'` rồi reload → banner corrupt + "Bắt đầu lại"; bấm → banner biến mất, tiến độ rỗng.

## Auto Run Result

Status: done

### Tóm tắt thay đổi
Xây nền `core/progress/` cho Epic 3: envelope có version + validator 3 trạng thái (`empty|ok|corrupt`), `ProgressStore` (DI storage, không throw xuyên tầng, snapshot ổn định cho `useSyncExternalStore`, rollback khi ghi lỗi, chặn ghi khi corrupt trừ `reset()`), và selectors thuần `getStreak`/`getNextItem`/`getWeekProgress` (streak quy ngày local). UI: hook `useProgress`, nút "✓ Hoàn thành bài hôm nay" trong LessonPage (gợi ý bài kế, không auto-navigate, toast khi ghi lỗi), checkmark trên card Lộ trình, banner corrupt toàn cục với "Bắt đầu lại".

### Files thay đổi
- `src/core/progress/envelope.ts` (mới) — types + `parseEnvelope` validate đầy đủ + `emptyEnvelope`/hằng số
- `src/core/progress/selectors.ts` (mới) — `getStreak`/`getNextItem`/`getWeekProgress` thuần, ngày local
- `src/core/progress/store.ts` (mới) — `ProgressStore` DI + snapshot ổn định + rollback + guard corrupt
- `src/core/progress/index.ts` (mới) — singleton + `resolveStorage()` guard window/try-catch + re-export
- `src/core/progress/progress.test.ts` (mới) — unit test env node, fake storage (Map + failWrite)
- `src/ui/useProgress.ts` (mới) — `useSyncExternalStore` binding
- `src/ui/ProgressCorruptBanner.tsx` + `.module.css` (mới) — banner corrupt + "Bắt đầu lại"
- `src/features/lesson/LessonPage.tsx` + `.module.css` — section nút hoàn thành + toast + gợi ý bài kế
- `src/features/roadmap/RoadmapPage.tsx` + `.module.css` — checkmark hoàn thành trên card
- `src/app/AppLayout.tsx` — mount banner corrupt trước `<Outlet/>`

### Review findings
- Patch áp dụng (2): (medium) bọc try/catch khi lấy `window.localStorage` → fallback in-memory, tránh trắng màn; (low) đổi `in` → `Object.hasOwn` (tránh dò prototype chain) ở store/selectors/LessonPage/RoadmapPage.
- Defer (3): đa-tab clobber (không nghe `storage` event); `parseEnvelope` không kiểm ISO-validity; `reset()` bỏ qua `WriteResult`. Ghi vào `deferred-work.md`.
- Reject (9): SSR getServerSnapshot, re-complete append session (đúng AR-5), corrupt không feedback cục bộ (đúng spec), streak theo sessions (đúng ngữ nghĩa), reset xóa raw corrupt (đúng spec), getNextItem về gap đầu (đúng spec), toast polite/transient (khớp "toast nhẹ"), emit nuốt lỗi listener, session tương lai.
- Follow-up review: không cần (`followup_review_recommended: false`) — 2 patch cục bộ, hậu quả thấp.

### Verification
- `npm run check` (tsc -b + oxlint src + vitest run + vite build): xanh — 9 test files, 143 tests pass, build OK. Chạy lại sau patch: vẫn 143 pass, build OK.

### Rủi ro còn lại
Các mục defer ở trên (đa-tab, ISO-validity, reset-no-feedback) — tất cả hẹp/ngoài mandate story, đã ghi nhận. React component (LessonPage/RoadmapPage/banner) không có test tự động — khoảng trống repo đã biết (thiếu jsdom, cấm thêm dependency).
