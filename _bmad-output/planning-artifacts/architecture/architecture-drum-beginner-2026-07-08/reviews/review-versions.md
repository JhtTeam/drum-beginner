# Review — Xác minh web (versions & technical claims)

- **Target:** `ARCHITECTURE-SPINE.md` (architecture-drum-beginner-2026-07-08)
- **Lens:** Reviewer web-verification — mọi quyết định đã commit phải được kiểm chứng trên web tại 2026-07-08, không khẳng định suông từ training data.
- **Ngày review:** 2026-07-08
- **Kết luận:** **PASS có điều kiện.** Toàn bộ bảng Stack khớp registry npm live tại ngày review — bằng chứng rõ ràng là đã verify web thật, không bịa version. Tuy nhiên có **1 claim bị tài liệu chính thức phản bác** (Vercel "SPA fallback native") và **2 điểm đã lỗi thời so với thực tế starter/runtime** (create-vite giờ ship oxlint chứ không phải ESLint; Node 20 đã EOL).

---

## 1. Bảng Stack — đối chiếu npm registry (fetch trực tiếp 2026-07-08)

| Claim trong spine | Thực tế web 2026-07-08 | Kết quả |
| --- | --- | --- |
| Node ≥ 20.19 | Vite 8 `engines.node`: `^20.19.0 \|\| >=22.12.0` — khớp đúng floor | ✅ đúng kỹ thuật, **nhưng xem F-3** (Node 20 đã EOL 2026-04-30) |
| Vite 8.1.x | `vite@latest` = **8.1.3** | ✅ |
| React 19.2.x | `react@latest` = **19.2.7** | ✅ |
| TypeScript 6.0.x (strict) | `typescript@latest` = **6.0.3** | ✅ |
| react-router 8.1.x (declarative) | `react-router@latest` = **8.1.0**; v8 tồn tại, có 3 mode (declarative/data/framework) per reactrouter.com/start/modes; v8 bỏ package `react-router-dom` → spine chọn đúng package `react-router` | ✅ |
| Vitest 4.1.x | `vitest@latest` = **4.1.10** | ✅ |
| @testing-library/react "latest" | **16.3.2**, peerDeps `react: ^18 \|\| ^19` → tương thích React 19.2 | ✅ |
| ESLint 10.x flat + typescript-eslint | `eslint@latest` = **10.6.0**; `typescript-eslint@latest` = **8.63.0**, peerDeps `eslint ^8.57 \|\| ^9 \|\| ^10`, `typescript >=4.8.4 <6.1.0` → combo ESLint 10 + TS 6.0 hợp lệ | ✅ tồn tại & tương thích, **nhưng xem F-2** (không còn là default của starter) |
| @fontsource/be-vietnam-pro 5.2.x | `@fontsource/be-vietnam-pro@latest` = **5.2.8**; Fontsource API xác nhận subset **vietnamese** + latin + latin-ext, 9 weight, italic | ✅ (đúng font, đúng subset tiếng Việt — chọn lựa hợp lý cho NFR-1) |
| Vercel static, free tier `[ASSUMPTION]` | Hobby plan miễn phí, non-commercial; 100GB bandwidth/tháng, vượt cap bị khóa 30 ngày — thừa đủ cho site học trống cá nhân | ✅ free tier ổn, **nhưng xem F-1** ("SPA fallback native" sai) |

Dòng dẫn "Verify trên web 2026-07-08" trong spine là **có thật**: cả 8 version đều trùng khớp chính xác với `latest` trên registry tại đúng ngày đó, kể cả những version không thể đoán từ training data (Vite 8, TS 6, ESLint 10, react-router 8 đều là major mới sau cutoff phổ biến).

## 2. Starter `npm create vite@latest -- --template react-ts` — defaults live

Đối chiếu `template-react-ts/package.json` trên nhánh main của vitejs/vite (đồng bộ với bản release, vite ^8.1.3):

- ✅ Khớp spine: `react ^19.2.7`, `typescript ~6.0.2`, `vite ^8.1.3` — seed đúng như bảng Stack.
- ⚠️ **Lệch spine:** template hiện ship **`oxlint ^1.72.0` + `.oxlintrc.json`**, **không còn ESLint** (xác nhận thêm qua vitejs/vite issue #22025 và README template). Xem F-2.

## 3. Claims kỹ thuật trong các AD

| AD | Claim | Kết quả xác minh |
| --- | --- | --- |
| AD-3 | Lookahead scheduler "A Tale of Two Clocks", tick ~25ms lên lịch trước ~100ms theo `AudioContext.currentTime` | ✅ Khớp nguyên văn bài canonical trên web.dev (`/articles/audio-scheduling`): "100ms of lookahead time, with intervals set to 25ms", dùng `AudioContext.currentTime`. Tên bài, số liệu, cơ chế đều đúng. |
| AD-3/AD-4 | React bind qua `useSyncExternalStore` | ✅ API tồn tại trong React 19, react.dev xác nhận đây đúng là hook cho "external store... state outside of React" — đúng use case engine/store framework-free. Lưu ý triển khai (không phải lỗi spine): snapshot phải immutable/cached (trả object mới mỗi lần → loop vô hạn), và mutation store trong transition bị hạ về blocking update — với beat event ~vài Hz thì vô hại. |
| AD-5 | CSS custom properties + CSS module per component, plain CSS với Vite | ✅ Vite docs: `*.module.css` là CSS modules out-of-the-box, plain CSS + custom properties không cần config. Không Tailwind/CSS-in-JS là lựa chọn, không phải claim kỹ thuật cần verify. |
| AD-6 | react-router v8 declarative mode, package `react-router`, 5 route | ✅ Declarative mode là mode chính thức nhẹ nhất (Link/useNavigate/useLocation) — đủ cho 5 route tĩnh. v8 xóa re-export `react-router-dom`, spine chỉ định đúng package. 5 slug (`/`, `/lo-trinh`, `/bai-hoc/:id`, `/metronome`, `/tien-do`) là claim nội bộ từ EXPERIENCE.md — không verify được trên web, nhất quán nội bộ trong spine. |
| AD-7 | `@fontsource/be-vietnam-pro` bundle self-host | ✅ Package tồn tại (5.2.8), mô hình Fontsource đúng là npm-install-rồi-bundle, không CDN runtime — khớp mục đích AD-7. Subset vietnamese có thật. |

## 4. Findings

### F-1 — MEDIUM-HIGH · "Vercel static (SPA fallback native)" bị docs Vercel phản bác trực tiếp

Bảng Stack ghi *"Hosting: Vercel static (SPA fallback native)"*. Docs chính thức **Vite on Vercel** (last_updated **2026-07-01**, mục "Using Vite to make SPAs") nói ngược lại: *"If your Vite app is configured to deploy as a Single Page Application (SPA), **deep linking won't work out of the box**"* — phải tạo `vercel.json` với rewrite `{"source": "/(.*)", "destination": "/index.html"}`. Nghĩa là fallback **không native**: thiếu file này thì reload/deep-link vào `/bai-hoc/gd1-t2-b3`, `/lo-trinh`… trả 404, phá thẳng AD-6. Dòng có tag `[ASSUMPTION]` (đúng quy trình) nhưng nội dung assumption sai theo nguồn chính thức mới nhất. **Đề xuất:** sửa thành "Vercel static + `vercel.json` rewrites về `/index.html`" và thêm file này vào Structural Seed.

### F-2 — MEDIUM · Starter react-ts đã đổi sang oxlint; "ESLint 10 flat + typescript-eslint" không còn là seed default

Template `react-ts` hiện tại ship **oxlint 1.72 + `.oxlintrc.json`**, không có ESLint (vitejs/vite issue #22025). Spine ghi "seed lúc khởi tạo" nhưng lint stack trong bảng (ESLint 10 + typescript-eslint) sẽ **không** có sẵn từ scaffold — team phải chủ động gỡ oxlint và tự dựng flat config + typescript-eslint. Bản thân combo ESLint 10.6 + typescript-eslint 8.63 + TS 6.0 đã verify là hợp lệ (peerDeps khớp), nên đây là lựa chọn dùng được — nhưng spine nên nói rõ đây là **thay thế default của starter** (hoặc cân nhắc giữ oxlint cho gọn). Hiện tại dòng này đọc như thể là default, gây bất ngờ ở bước init.

### F-3 — MEDIUM · Node ≥ 20.19: đúng floor của Vite nhưng Node 20 đã EOL

Node.js 20 "Iron" hết hạn hỗ trợ (EOL) ngày **2026-04-30** — trước ngày review hơn 2 tháng, không còn security patch. Spine chép đúng floor `^20.19.0` từ engines của Vite 8, nhưng khuyến nghị thực tế tại 2026-07 phải là **Node ≥ 22.12 (LTS)** — cũng nằm sẵn trong engines Vite (`>=22.12.0`). **Đề xuất:** đổi dòng Node thành "≥ 22.12 (LTS; floor kỹ thuật của Vite là 20.19 nhưng Node 20 đã EOL)".

### F-4 — LOW · "TypeScript 7.0 đang RC; nâng cấp drop-in khi stable" — đúng nhưng hơi lạc quan

Xác nhận: TS 7.0 RC công bố **2026-06-18** (devblogs.microsoft.com), stable dự kiến ~1 tháng sau RC — phần "đang RC" chính xác tại ngày viết. Tuy nhiên "drop-in" chỉ đúng cho compiler: `typescript-eslint@8.63.0` hiện peer `typescript <6.1.0`, tức chuỗi lint (nếu giữ ESLint theo F-2) **chưa** drop-in với TS 7 ngày stable. Deferred note nên thêm điều kiện "khi toolchain (typescript-eslint/Vitest) đã hỗ trợ".

### F-5 — INFO · Các claim không verify được trên web (chấp nhận được)

- 5 slug route và token DESIGN.md là tham chiếu nội bộ (EXPERIENCE.md/DESIGN.md) — không thuộc phạm vi web-verify, nhất quán nội bộ.
- "Âm thanh mẫu file miễn phí bản quyền (PRD A4)" — chưa chỉ nguồn cụ thể; sẽ cần verify license khi chọn file thật.
- Vercel Hobby: nhắc thêm ràng buộc **non-commercial** của free tier — dự án học cá nhân thì hợp lệ, nhưng nên ghi chú nếu có ý định gắn doanh thu sau này.

## 5. Đếm

- **Claim kiểm chứng trên web:** 15 — trong đó **12 khớp hoàn toàn**, 1 bị phản bác (F-1), 2 lỗi thời một phần (F-2, F-3).
- **Findings:** 1 Medium-High, 2 Medium, 1 Low, 1 Info.
- **Không phát hiện** technology bịa tên, version tưởng tượng, hay pattern không tồn tại — chất lượng web-grounding của spine ở mức tốt.

## 6. Nguồn chính

- registry.npmjs.org: `vite`, `react`, `typescript`, `react-router`, `vitest`, `eslint`, `typescript-eslint`, `@fontsource/be-vietnam-pro`, `@testing-library/react` (endpoint `/latest`, 2026-07-08)
- github.com/vitejs/vite — `packages/create-vite/template-react-ts/package.json` (main) + issue #22025 (oxlint in templates)
- vercel.com/docs/frameworks/frontend/vite (last_updated 2026-07-01) — mục "Using Vite to make SPAs"
- web.dev/articles/audio-scheduling — "A Tale of Two Clocks"
- react.dev/reference/react/useSyncExternalStore
- vite.dev/guide/features — CSS Modules
- reactrouter.com/start/modes + changelog (v8, bỏ react-router-dom)
- devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc (2026-06-18)
- endoflife.date/nodejs + nodejs.org (Node 20 EOL 2026-04-30)
- api.fontsource.org/v1/fonts/be-vietnam-pro (subset vietnamese)
- vercel.com/docs/plans/hobby + /docs/limits (free tier)
