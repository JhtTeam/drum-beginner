// Giáo trình Giai đoạn 1 — dữ liệu thuần (AD-2), chỉ import từ core (AD-1).
// AD-4: các id gd1-t{w}-b{n} là khóa progress vĩnh viễn — KHÔNG đổi/đánh số lại.
// NFR-1: thuật ngữ trống giữ tiếng Anh, chú thích tiếng Việt lần đầu mỗi bài.
import type { Phase } from '../core/types'

export const phase1: Phase = {
  id: 'gd1',
  title: 'Giai đoạn 1 — Nền tảng đầu tiên',
  weeks: [
    {
      weekNumber: 1,
      title: 'Làm quen & nhịp đầu tiên',
      items: [
        {
          // Anchor KF-2: bài mở đầu cố định — story 2.3 gắn DrumMap vào đúng bài này.
          id: 'gd1-t1-b1',
          kind: 'theory',
          title: 'Làm quen bộ trống',
          objective:
            'Bạn gọi tên được 6 bộ phận chính của bộ trống và biết mỗi bộ phận dùng để làm gì.',
          theory: [
            'Chào mừng bạn đến với buổi đầu tiên! Trước khi đánh bất kỳ nốt nào, mình cùng nhìn quanh bộ trống một vòng. Bộ trống cơ bản có 6 bộ phận, và bạn sẽ gặp lại chúng trong mọi bài sau này.',
            'Ngay trước mặt bạn là snare (trống lẫy — trống chính, tiếng đanh và gọn). Bên cạnh là tom (trống tròn gắn phía trên hoặc đứng cạnh, tiếng trầm hơn snare, hay dùng để chuyển đoạn). Dưới chân phải là kick (trống cái — trống to nhất, đạp bằng bàn đạp, giữ phần "thịch thịch" của bài nhạc).',
            'Phía tay trái là hi-hat (cặp chũm chọe đóng mở bằng chân trái — âm thanh "chíc chíc" đều đặn giữ nhịp). Còn lại hai lá lớn: crash (chũm chọe đánh điểm nhấn, tiếng "xoảng" bùng nổ) và ride (chũm chọe lớn nhất, gõ đều thay hi-hat khi cần màu sắc khác).',
            'Bạn chưa cần nhớ hết ngay đâu. Tuần này bạn chỉ chơi trên snare thôi — các bộ phận khác sẽ lần lượt xuất hiện khi bạn sẵn sàng.',
          ],
          practiceSteps: [
            'Ngồi vào bộ trống (hoặc nhìn ảnh một bộ trống), chỉ tay và gọi tên từng bộ phận: snare, tom, kick, hi-hat, crash, ride.',
            'Nói to công dụng của từng bộ phận theo cách của bạn — không cần đúng từng chữ, hiểu là được.',
            'Gõ nhẹ thử từng bộ phận (nếu có trống) và lắng nghe sự khác nhau giữa các âm thanh.',
            'Tự kiểm: che bài học lại và kể đủ 6 cái tên. Thiếu cái nào thì nhìn lại một lần nữa — vậy là xong buổi đầu!',
          ],
          // FR-5: video addendum B — thứ tự mảng = thứ tự hiển thị, VI trước EN (UX-DR6)
          videos: [
            {
              youtubeId: 'VI70TWXRKLM',
              lang: 'vi',
              title: 'Tìm hiểu các bộ phận và tiếng trong 1 bộ trống — Việt Thương Music',
            },
            {
              youtubeId: '-W9qhBrw2Lk',
              lang: 'vi',
              title: 'Học trống - Thành phần của một bộ trống — Soul Institute of Arts',
            },
            {
              youtubeId: 'Doxa4nYB4yo',
              lang: 'vi',
              title: 'Trống Jazz - Cấu tạo, tính năng từng bộ phận — Trung Drum',
            },
            {
              youtubeId: 'LYNnF7iUE8U',
              lang: 'vi',
              title: 'Học TRỐNG cơ bản Bài 1: Làm quen với trống — Pong Ơi',
            },
          ],
        },
        {
          id: 'gd1-t1-b2',
          kind: 'theory',
          title: 'Cách cầm dùi & tư thế ngồi',
          objective:
            'Bạn cầm dùi đúng kiểu matched grip và ngồi đúng tư thế để tập lâu không mỏi.',
          theory: [
            'Cách cầm dùi quyết định 80% âm thanh của bạn sau này, nên mình làm chậm và làm đúng ngay từ đầu. Kiểu cầm phổ biến nhất là matched grip (cầm đối xứng — hai tay cầm giống hệt nhau), và đó là kiểu bạn học hôm nay.',
            'Đặt dùi vào điểm cân bằng: cầm ở khoảng 1/3 chiều dài tính từ đuôi dùi. Kẹp nhẹ dùi giữa ngón cái và đốt đầu của ngón trỏ — đây là fulcrum (điểm tựa — nơi dùi xoay). Các ngón còn lại ôm hờ quanh thân dùi, không siết chặt. Dùi phải nảy được tự nhiên trong tay bạn.',
            'Về tư thế: ngồi trên ghế trống với đùi hơi dốc xuống, lưng thẳng nhưng thả lỏng, hai vai buông tự nhiên. Khuỷu tay để gần người, không khép cứng. Nếu bạn thấy vai gồng lên, hãy hạ ghế xuống một chút.',
            'Nguyên tắc vàng: thoải mái hơn là "đúng sách". Cầm chặt quá hay ngồi gồng sẽ khiến bạn mỏi và tiếng trống bị nghẹt.',
          ],
          practiceSteps: [
            'Cầm dùi bằng ngón cái và ngón trỏ ở điểm 1/3 từ đuôi, thả các ngón còn lại ôm hờ quanh thân dùi.',
            'Thả dùi rơi tự do xuống mặt trống (hoặc gối tập) và quan sát độ nảy — dùi nảy tự nhiên nghĩa là bạn không siết quá chặt.',
            'Ngồi vào ghế, chỉnh độ cao sao cho đùi hơi dốc xuống, lưng thẳng, vai thả lỏng.',
            'Đánh 20 nhát chậm rãi tay phải rồi 20 nhát tay trái, chỉ để ý cảm giác cầm dùi — chưa cần nhịp.',
            'Soi gương hoặc quay video 30 giây để kiểm tra: vai có nhô lên không, cổ tay có cứng không.',
          ],
          videos: [
            {
              youtubeId: 'Zvgpjio8n4c',
              lang: 'vi',
              title: 'Hướng dẫn đánh trống cơ bản: Cách cầm dùi trống — Việt Thương Music',
            },
            {
              youtubeId: 'h8rWFXOoSEc',
              lang: 'vi',
              title:
                'Học trống căn bản Bài 2 - Tư Thế Ngồi, Cách Cầm Dùi Và Setup Bộ Trống — Tran Tin Drummer',
            },
            {
              youtubeId: 'mTkuxDQEnk4',
              lang: 'vi',
              title: 'Hướng dẫn tự học trống: Bài 2 - Cách cầm dùi — Duy Phan',
            },
          ],
        },
        {
          id: 'gd1-t1-b3',
          kind: 'theory',
          title: 'Metronome là gì — giữ nhịp đầu tiên ở 60 bpm',
          objective:
            'Bạn hiểu metronome dùng để làm gì và vỗ tay đều theo tiếng tick ở 60 bpm.',
          theory: [
            'Metronome (máy đếm nhịp — thiết bị phát tiếng tick đều đặn) là người bạn tập quan trọng nhất của mọi tay trống. Nó không bao giờ nhanh lên hay chậm đi, nên nó giúp bạn nghe được chính mình đang lệch nhịp ở đâu.',
            'Tốc độ của metronome đo bằng bpm (beats per minute — số phách mỗi phút). 60 bpm nghĩa là mỗi giây đúng một tiếng tick — chậm rãi như kim giây đồng hồ. Nghe thì dễ, nhưng giữ đều tuyệt đối ở tốc độ chậm lại là thử thách thật sự đấy!',
            'Mục tiêu của cả Giai đoạn 1 là bạn chơi vững trong khoảng 60–80 bpm. Đừng vội tăng nhanh: chơi sạch ở 60 rồi mới nâng dần lên 80. Chậm mà đều luôn thắng nhanh mà loạn.',
            'Ứng dụng này có sẵn trang Metronome — bạn mở tab Metronome bất cứ lúc nào để tập cùng.',
          ],
          practiceSteps: [
            'Mở trang Metronome trong app, đặt tốc độ 60 bpm và bấm chạy.',
            'Nhắm mắt nghe 30 giây, cảm nhận khoảng cách đều nhau giữa các tiếng tick.',
            'Vỗ tay trùng khớp với tiếng tick trong 1 phút — nếu tiếng vỗ "nuốt" tiếng tick nghĩa là bạn đang trùng rất tốt.',
            'Thử dậm chân phải theo tick 1 phút (làm quen dần với chân kick sau này).',
            'Nghỉ 1 phút rồi lặp lại cả chuỗi 2 lần nữa. Tổng cộng chỉ khoảng 10 phút thôi.',
          ],
          // AR-7: video en BẮT BUỘC có note tóm tắt tiếng Việt (ép ở compile time)
          videos: [
            {
              youtubeId: '8bcNVm9tut8',
              lang: 'vi',
              title:
                'Bài 5: Bí mật làm chủ nhịp điệu trống: Tempo & Metronome cho người mới — GIAO DRUM',
            },
            {
              youtubeId: 'qc7wPNHCFnU',
              lang: 'en',
              title: 'Playing Drums To A Metronome — Drum Beats Online',
              note: 'Video tiếng Anh về cách tập trống cùng metronome — bạn chỉ cần nhìn động tác và cách anh ấy đếm nhịp là đủ, không cần hiểu hết lời.',
            },
            {
              youtubeId: 'gSmf7W3DUjs',
              lang: 'en',
              title: '60 BPM Metronome (click track luyện tập) — Drumset Fundamentals',
              note: 'Track metronome 60 bpm dài 30 phút, không lời — bạn bật lên tập cùng khi muốn đổi vị tiếng tick.',
            },
          ],
        },
        {
          id: 'gd1-t1-b4',
          kind: 'exercise',
          title: 'Single stroke ở 60 bpm',
          objective:
            'Bạn đánh được single stroke R L R L trùng tiếng metronome ở 60 bpm, mỗi tay một nhát đều nhau.',
          theory: [
            'Single stroke (dùi đơn — mỗi tay đánh một nhát luân phiên) là rudiment (bài tập mẫu cơ bản của trống) đầu tiên và quan trọng nhất. Gần như mọi thứ bạn chơi sau này đều xây từ nó.',
            'Công thức rất gọn: R L R L — R là tay phải (Right), L là tay trái (Left). Mỗi nhát rơi đúng một tiếng tick của metronome. Không nhanh hơn, không chậm hơn.',
            'Ở 60 bpm bạn có cả một giây giữa hai nhát — hãy dùng khoảng trống đó để thả lỏng và chuẩn bị tay tiếp theo. Tập chậm chính là đang tập kiểm soát.',
          ],
          practiceSteps: [
            'Bật metronome 60 bpm, ngồi đúng tư thế đã học ở bài trước.',
            'Đánh R L R L trên snare (hoặc gối tập), mỗi nhát trùng một tiếng tick, trong 1 phút.',
            'Nghỉ 30 giây, lắng nghe lại: hai tay có kêu to bằng nhau không?',
            'Lặp lại 5 hiệp 1 phút. Nếu lệch nhịp, dừng hẳn rồi vào lại từ đầu hiệp — đừng cố đuổi theo tick.',
            'Kết thúc bằng 1 hiệp nhắm mắt đánh, chỉ dựa vào tai.',
          ],
          videos: [
            {
              youtubeId: 'IpXHV9CUvho',
              lang: 'vi',
              title: 'Học Trống cơ bản Bài 2: Bài tập tay cơ bản (Single Stroke) — Pong Ơi',
            },
          ],
          exercise: {
            pattern: ['R', 'L', 'R', 'L'],
            targetTempo: { from: 60, to: 65 },
            techniqueNotes: [
              'Thả lỏng cổ tay — lực đánh đến từ cú vẩy cổ tay, không phải cả cánh tay.',
              'Lực đều hai tay: tay trái thường yếu hơn, chú ý cho nó kêu to bằng tay phải.',
              'Dùi nảy lên tự nhiên sau mỗi nhát, đừng ghìm dùi xuống mặt trống.',
            ],
          },
        },
        {
          id: 'gd1-t1-b5',
          kind: 'exercise',
          title: 'Single stroke đều tay — nâng 60 lên 70 bpm',
          objective:
            'Bạn giữ single stroke sạch và đều khi tăng dần tốc độ từ 60 lên 70 bpm.',
          theory: [
            'Hôm qua bạn đã đánh được single stroke (dùi đơn — R L luân phiên) ở 60 bpm. Hôm nay mình tăng tốc — nhưng theo cách của tay trống: tăng từng nấc nhỏ, và chỉ tăng khi nấc hiện tại đã sạch.',
            '"Sạch" nghĩa là: mọi nhát trùng tick, hai tay to đều nhau, và bạn vẫn thấy thoải mái. Nếu một trong ba điều đó vỡ, quay về tốc độ cũ. Không ai chấm điểm tốc độ của bạn cả — độ đều mới là thứ đáng khoe.',
            'Mẹo nhỏ: khi tăng tốc, cơ thể có xu hướng gồng lên. Cứ mỗi lần đổi tốc độ, hít một hơi sâu và thả vai xuống trước khi đánh nhát đầu tiên.',
          ],
          practiceSteps: [
            'Khởi động: single stroke ở 60 bpm trong 1 phút cho nóng tay.',
            'Tăng lên 64 bpm, đánh 1 phút. Sạch thì đi tiếp, chưa sạch thì ở lại thêm 1 phút.',
            'Tăng lên 67 bpm, đánh 1 phút với cùng tiêu chí.',
            'Tăng lên 70 bpm, đánh 2 phút. Đây là đích của hôm nay.',
            'Hạ ngược về 60 bpm đánh 1 phút cuối — bạn sẽ ngạc nhiên vì thấy 60 dễ hẳn đi!',
          ],
          videos: [],
          exercise: {
            pattern: ['R', 'L', 'R', 'L'],
            targetTempo: { from: 60, to: 70 },
            techniqueNotes: [
              'Chỉ tăng tốc khi nấc hiện tại sạch — lệch là quay về nấc trước.',
              'Giữ cổ tay thả lỏng khi tăng tốc, đừng để vai gồng theo.',
              'Độ cao nhấc dùi hai tay bằng nhau thì tiếng mới đều nhau.',
            ],
          },
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Kiểm soát dùi',
      items: [
        {
          id: 'gd1-t2-b1',
          kind: 'theory',
          title: 'Thả lỏng cổ tay, lực đều hai tay',
          objective:
            'Bạn nhận biết được khi nào mình đang gồng và biết cách đưa cổ tay về trạng thái thả lỏng.',
          theory: [
            'Sang tuần 2 rồi! Trước khi học kỹ thuật mới, mình dành một bài nói về thứ quyết định bạn chơi được bao lâu và hay đến đâu: sự thả lỏng.',
            'Cổ tay gồng là kẻ thù số một của người mới. Dấu hiệu nhận biết: đánh 2 phút thấy mỏi cẳng tay, tiếng trống nghe cứng và nghẹt, dùi không nảy. Khi thấy một trong các dấu hiệu này, hãy dừng lại, buông thõng hai tay, lắc nhẹ vài giây rồi mới chơi tiếp.',
            'Vấn đề thứ hai là lực lệch tay: hầu hết chúng ta thuận tay phải, nên nhát L (tay trái) thường nhỏ và yếu hơn nhát R (tay phải). Cách chữa không phải đánh tay phải nhỏ đi, mà là cho tay trái tập nhiều hơn và lắng nghe nó.',
            'Từ giờ trở đi, mọi bài tập đều ngầm kèm hai câu hỏi: "Cổ tay mình có đang thả lỏng không?" và "Hai tay có kêu to bằng nhau không?".',
          ],
          practiceSteps: [
            'Buông thõng hai tay, lắc nhẹ cổ tay 10 giây — ghi nhớ cảm giác thả lỏng này làm chuẩn.',
            'Đánh 8 nhát chỉ bằng tay trái ở 60 bpm, nghe kỹ độ to; rồi 8 nhát tay phải để so sánh.',
            'Đánh single stroke 1 phút, cứ 4 nhát lại tự hỏi nhanh: vai và cổ tay có gồng không?',
            'Thử cố tình siết chặt dùi đánh 4 nhát, rồi thả lỏng đánh 4 nhát — nghe sự khác biệt của âm thanh.',
            'Chốt buổi: 2 phút single stroke ở 60 bpm với ưu tiên duy nhất là hai tay to đều nhau.',
          ],
          videos: [],
        },
        {
          id: 'gd1-t2-b2',
          kind: 'exercise',
          title: 'Double stroke ở 60 bpm',
          objective:
            'Bạn đánh được double stroke R R L L ở 60 bpm với hai nhát mỗi tay to đều nhau.',
          theory: [
            'Double stroke (dùi kép — mỗi tay đánh hai nhát liên tiếp) là rudiment thứ hai của bạn: R R L L. Nghe đơn giản nhưng nó dạy tay bạn một kỹ năng mới — tận dụng độ nảy của dùi.',
            'Bí quyết của nhát kép: nhát thứ nhất bạn đánh xuống, nhát thứ hai để dùi nảy lên rồi dùng các ngón tay "hứng" và đẩy nhẹ xuống lần nữa. Đừng dùng cổ tay đánh hai lần riêng biệt — sẽ rất mỏi và không đều.',
            'Lỗi phổ biến nhất: nhát thứ hai nhỏ hơn nhát thứ nhất. Ở 60 bpm bạn có đủ thời gian để nghe từng nhát — hãy đòi hỏi cả bốn nhát R R L L to bằng nhau.',
          ],
          practiceSteps: [
            'Không metronome: đánh R R chậm rãi, tập cảm giác nhát hai nảy lên từ mặt trống, 1 phút. Làm tương tự với L L.',
            'Bật metronome 60 bpm, đánh R R L L mỗi nhát một tick, trong 1 phút.',
            'Nghỉ 30 giây, tự hỏi: nhát thứ hai của mỗi tay có nhỏ hơn nhát đầu không?',
            'Lặp lại 4 hiệp 1 phút, mỗi hiệp tập trung nghe một tay.',
            'Chốt buổi bằng 1 phút single stroke ở 60 bpm để cảm nhận sự khác nhau giữa hai rudiment.',
          ],
          videos: [
            {
              youtubeId: '_wYDJjCFtNY',
              lang: 'vi',
              title: 'Học TRỐNG cơ bản Bài 3: Bài tập tay cơ bản (Double Stroke) — Pong Ơi',
            },
          ],
          exercise: {
            pattern: ['R', 'R', 'L', 'L'],
            targetTempo: { from: 60, to: 65 },
            techniqueNotes: [
              'Nhát thứ hai dùng độ nảy của dùi + ngón tay đẩy nhẹ, không vung cổ tay lần hai.',
              'Bốn nhát R R L L phải to đều nhau — nghe kỹ nhát thứ hai của mỗi tay.',
              'Thả lỏng cổ tay; nếu cẳng tay mỏi nghĩa là bạn đang đánh bằng lực thay vì độ nảy.',
            ],
          },
        },
        {
          id: 'gd1-t2-b3',
          kind: 'exercise',
          title: 'Single + double xen kẽ ở 60–70 bpm',
          objective:
            'Bạn chuyển mượt giữa single stroke và double stroke mà không lệch nhịp ở 60–70 bpm.',
          theory: [
            'Bạn đã có hai rudiment: single stroke (R L R L) và double stroke (R R L L). Hôm nay mình ghép chúng lại — một vòng single rồi một vòng double, lặp mãi: R L R L R R L L.',
            'Điểm khó nằm ở khoảnh khắc chuyển: từ "mỗi tick đổi tay" sang "hai tick mới đổi tay". Não bạn sẽ khựng lại một chút ở lần đầu — hoàn toàn bình thường, ai cũng thế.',
            'Chiến thuật: đọc to "đơn hai ba bốn, kép kép trái trái" hoặc bất kỳ câu đếm nào giúp bạn nhớ đang ở đoạn nào. Đọc to nghe hơi buồn cười nhưng hiệu quả bất ngờ đấy.',
          ],
          practiceSteps: [
            'Ôn riêng: 1 phút single ở 60 bpm, rồi 1 phút double ở 60 bpm.',
            'Ghép chuỗi R L R L R R L L ở 60 bpm, đánh chậm và đọc to theo, trong 1 phút.',
            'Lặp 3 hiệp 1 phút ở 60 bpm, để ý nhất khoảnh khắc chuyển giữa hai kiểu.',
            'Khi đã mượt, nâng lên 65 rồi 70 bpm, mỗi nấc 1–2 phút.',
            'Nếu vỡ nhịp ở nấc nào, quay về nấc trước — sạch rồi mới đi tiếp.',
          ],
          videos: [],
          exercise: {
            pattern: ['R', 'L', 'R', 'L', 'R', 'R', 'L', 'L'],
            targetTempo: { from: 60, to: 70 },
            techniqueNotes: [
              'Giữ tick metronome làm trọng tài — mọi nhát đều phải trùng tick, kể cả lúc chuyển kiểu.',
              'Đọc to theo pattern để não không khựng ở điểm chuyển single ↔ double.',
              'Thả lỏng cổ tay, lực đều hai tay — tiêu chí cũ vẫn áp dụng cho chuỗi mới.',
            ],
          },
        },
        {
          id: 'gd1-t2-b4',
          kind: 'exercise',
          title: 'Double stroke — nâng 60 lên 70 bpm',
          objective:
            'Bạn giữ double stroke sạch, hai nhát mỗi tay đều nhau, khi tăng dần từ 60 lên 70 bpm.',
          theory: [
            'Buổi chốt tuần 2: đưa double stroke (dùi kép — R R L L) lên 70 bpm, đúng cách bạn đã làm với single stroke tuần trước.',
            'Khi tốc độ tăng, nhát thứ hai của mỗi tay càng dễ bị nuốt nhỏ đi — vì thời gian "hứng" độ nảy ngắn lại. Đây chính là lý do bài này tồn tại: tốc độ chỉ có giá trị khi độ đều đi cùng.',
            'Nếu hôm nay bạn chỉ lên được 67 bpm mà sạch, thế vẫn là thắng. Con số 70 sẽ tự đến sau một hai buổi nữa — sự kiên nhẫn lúc này là khoản đầu tư lãi nhất.',
          ],
          practiceSteps: [
            'Khởi động: double stroke ở 60 bpm trong 2 phút, nghe kỹ nhát thứ hai mỗi tay.',
            'Tăng lên 64 bpm, đánh 1 phút. Bốn nhát to đều thì đi tiếp.',
            'Tăng lên 67 bpm, đánh 1 phút với cùng tiêu chí.',
            'Tăng lên 70 bpm, đánh 2 phút — đích của tuần này.',
            'Hạ về 60 bpm, 1 phút cuối thả lỏng hoàn toàn để chốt buổi.',
          ],
          videos: [],
          exercise: {
            pattern: ['R', 'R', 'L', 'L'],
            targetTempo: { from: 60, to: 70 },
            techniqueNotes: [
              'Tốc độ tăng thì càng phải nghe nhát thứ hai — không để nó bị nuốt nhỏ.',
              'Chỉ lên nấc mới khi nấc hiện tại sạch; vỡ là lùi một nấc.',
              'Cổ tay thả lỏng, tận dụng độ nảy — gồng lên là dấu hiệu cần giảm tốc.',
            ],
          },
        },
      ],
    },
    {
      weekNumber: 3,
      title: 'Paradiddle & tăng tốc',
      items: [
        {
          id: 'gd1-t3-b1',
          kind: 'exercise',
          title: 'Paradiddle ở 60 bpm',
          objective:
            'Bạn đánh được paradiddle R L R R L R L L ở 60 bpm mà không vấp ở nhát kép.',
          theory: [
            'Tuần cuối của Giai đoạn 1 mở màn bằng rudiment nổi tiếng nhất thế giới trống: paradiddle (para-điđồ — chuỗi kết hợp dùi đơn và dùi kép trong một câu). Công thức: R L R R L R L L.',
            'Nhìn kỹ nhé: hai nhát đầu là single (R L), hai nhát sau là double (R R) — rồi cả cụm lặp lại nhưng đảo tay (L R L L). Bạn đã học đủ cả hai "nguyên liệu" ở tuần trước, giờ chỉ là trộn chúng theo thứ tự mới.',
            'Điều kỳ diệu của paradiddle: sau mỗi cụm 4 nhát, tay dẫn tự động đổi bên. Nhờ vậy tay trái của bạn được tập dẫn dắt y hệt tay phải — bài thuốc chữa lệch tay tốt nhất.',
            'Đi thật chậm. 60 bpm với đầy đủ sự chú ý ăn đứt 100 bpm mà vấp liên tục.',
          ],
          practiceSteps: [
            'Chưa cần trống: đọc to "R L R R, L R L L" theo tick 60 bpm cho thuộc miệng, 1 phút.',
            'Đánh chuỗi trên snare (hoặc gối) ở 60 bpm, mỗi nhát một tick, 1 phút — vấp thì dừng và vào lại.',
            'Lặp 4 hiệp 1 phút; mỗi hiệp chọn nghe một thứ: tick, tay phải, tay trái, nhát kép.',
            'Chú ý riêng nhát kép (R R và L L): hai nhát phải to đều như bạn đã tập ở double stroke.',
            'Chốt buổi: 1 phút cuối nhắm mắt, chỉ dựa vào tai và trí nhớ của tay.',
          ],
          videos: [
            {
              youtubeId: 'nRJBK5_o5SM',
              lang: 'vi',
              title: 'Tự học trống: Paradiddle — Duy Phan',
            },
            {
              youtubeId: 'h0OoVP6VgBE',
              lang: 'en',
              title: 'How To Play A Paradiddle — Drum Rudiment Lesson — Drumeo',
              note: 'Video 1 phút của Drumeo: bạn nhìn rõ thứ tự tay R-L-R-R L-R-L-L đánh thật chậm — xem động tác là đủ, không cần nghe hiểu.',
            },
          ],
          exercise: {
            pattern: ['R', 'L', 'R', 'R', 'L', 'R', 'L', 'L'],
            targetTempo: { from: 60, to: 65 },
            techniqueNotes: [
              'Đọc to R L R R / L R L L cho đến khi miệng thuộc trước tay.',
              'Nhát kép giữa câu dễ bị nhỏ — áp dụng kỹ thuật độ nảy từ bài double stroke.',
              'Sau mỗi cụm 4 nhát tay dẫn đổi bên — để ý cho tay trái dẫn tự tin như tay phải.',
            ],
          },
        },
        {
          id: 'gd1-t3-b2',
          kind: 'exercise',
          title: 'Paradiddle — nâng 60 lên 70 bpm',
          objective:
            'Bạn giữ paradiddle trôi chảy và đều khi tăng dần từ 60 lên 70 bpm.',
          theory: [
            'Paradiddle của bạn đã chạy được ở 60 bpm — giờ mình nâng nó lên 70 theo đúng công thức quen thuộc: từng nấc nhỏ, sạch mới lên.',
            'Ở tốc độ cao hơn, thử thách lớn nhất của paradiddle là giữ cho câu "chảy" liền mạch — không bị khựng ở điểm nối giữa hai cụm (chỗ L L chuyển sang R). Nếu thấy khựng, hãy đánh chậm lại và nghe riêng điểm nối đó vài lần.',
            'Bạn đang ở rất gần vạch đích của Giai đoạn 1 rồi. Cứ đều đặn thế này thôi!',
          ],
          practiceSteps: [
            'Khởi động: paradiddle ở 60 bpm trong 2 phút, đọc thầm theo pattern.',
            'Tăng lên 64 bpm, đánh 1 phút — chú ý điểm nối L L → R giữa hai cụm.',
            'Tăng lên 67 bpm, đánh 1 phút; vấp thì lùi về 64.',
            'Tăng lên 70 bpm, đánh 2 phút — đích của buổi hôm nay.',
            'Hạ về 60 bpm đánh 1 phút cuối cho tay ghi nhớ cảm giác thong thả.',
          ],
          videos: [],
          exercise: {
            pattern: ['R', 'L', 'R', 'R', 'L', 'R', 'L', 'L'],
            targetTempo: { from: 60, to: 70 },
            techniqueNotes: [
              'Nghe riêng điểm nối giữa hai cụm (L L sang R) — chỗ dễ khựng nhất khi tăng tốc.',
              'Chỉ tăng nấc khi câu chảy liền mạch và đều hai tay.',
              'Vai và cổ tay thả lỏng — tốc độ đến từ sự gọn gàng, không phải từ sức.',
            ],
          },
        },
        {
          id: 'gd1-t3-b3',
          kind: 'exercise',
          title: 'Tổng hợp single, double, paradiddle — 70 lên 80 bpm',
          objective:
            'Bạn chơi liền mạch chuỗi single, double và paradiddle, giữ sạch khi nâng từ 70 lên 80 bpm.',
          theory: [
            'Bài tổng hợp lớn của Giai đoạn 1: ghép cả ba rudiment bạn đã học thành một vòng 16 nhát — 4 nhát single (R L R L), 4 nhát double (R R L L), rồi trọn một câu paradiddle (R L R R L R L L).',
            'Đây vừa là bài tập vừa là bài kiểm tra: mỗi lần chuyển kiểu là một lần não và tay bạn phải phối hợp lại. Chuyển mượt cả vòng ở 70 bpm nghĩa là ba rudiment đã thực sự là của bạn.',
            'Đích cuối là 80 bpm — ranh giới trên của Giai đoạn 1. Không cần đạt ngay hôm nay; bạn có thể quay lại bài này nhiều buổi cho đến khi 80 bpm nghe nhẹ nhàng.',
          ],
          practiceSteps: [
            'Ôn nhanh từng rudiment riêng ở 70 bpm, mỗi kiểu 1 phút.',
            'Ghép vòng 16 nhát ở 70 bpm, đọc to tên kiểu khi vào đoạn mới ("đơn… kép… para…"), 2 phút.',
            'Lặp 3 hiệp 2 phút ở 70 bpm cho đến khi các điểm chuyển hết khựng.',
            'Nâng lên 75 bpm 2 phút, rồi 80 bpm 2 phút — vỡ ở đâu lùi một nấc ở đó.',
            'Chốt buổi: hạ về 70 bpm chơi 1 vòng cuối thật thong thả, tận hưởng thành quả của bạn.',
          ],
          videos: [],
          exercise: {
            pattern: [
              'R', 'L', 'R', 'L',
              'R', 'R', 'L', 'L',
              'R', 'L', 'R', 'R',
              'L', 'R', 'L', 'L',
            ],
            targetTempo: { from: 70, to: 80 },
            techniqueNotes: [
              'Mỗi điểm chuyển kiểu là một điểm kiểm tra — giữ tick metronome làm trọng tài tuyệt đối.',
              'Lực đều hai tay xuyên suốt cả ba kiểu, đặc biệt các nhát kép.',
              'Sạch ở 70 mới nâng 75, sạch 75 mới nâng 80 — đúng tinh thần "chậm mà đều".',
            ],
          },
        },
        {
          id: 'gd1-t3-b4',
          kind: 'theory',
          title: 'Tổng kết Giai đoạn 1 — tự kiểm tra',
          objective:
            'Bạn tự đánh giá được mình đã đạt chuẩn Giai đoạn 1 chưa và biết mình cần ôn lại phần nào.',
          theory: [
            'Chúc mừng bạn đã đi hết 3 tuần đầu tiên! Trước khi bước tiếp, mình dừng lại một buổi để nhìn xem hành trang đã đủ chưa.',
            'Chuẩn hoàn thành Giai đoạn 1 gồm hai điều: một — bạn giữ nhịp vững cùng metronome trong khoảng 60–80 bpm; hai — bạn chơi sạch single stroke và double stroke ở 60 bpm (paradiddle trôi chảy là điểm cộng lớn).',
            '"Sạch" vẫn theo nghĩa bạn đã quen: mọi nhát trùng tick, hai tay to đều nhau, cổ tay thả lỏng suốt bài. Nếu mục nào chưa đạt, hoàn toàn không sao — quay lại đúng bài của mục đó tập thêm vài buổi rồi kiểm lại. Lộ trình không có deadline.',
            'Còn nếu bạn tích được đủ các mục? Vậy thì nền móng của bạn đã vững hơn phần lớn người mới bỏ cuộc ở tuần đầu. Hẹn gặp bạn ở giai đoạn tiếp theo!',
          ],
          practiceSteps: [
            'Kiểm mục 1: bật metronome 60 bpm, đánh single stroke 2 phút liên tục không lệch tick.',
            'Kiểm mục 2: double stroke ở 60 bpm trong 2 phút, bốn nhát R R L L to đều nhau.',
            'Kiểm mục 3: giữ nhịp ở 80 bpm với single stroke trong 1 phút — ranh giới trên của giai đoạn.',
            'Kiểm mục cộng thêm: paradiddle ở 60–70 bpm trôi chảy, không khựng ở điểm nối.',
            'Ghi ra mục nào chưa đạt và quay lại bài tương ứng trong lộ trình để ôn — rồi kiểm lại sau vài buổi.',
          ],
          videos: [],
        },
      ],
    },
  ],
}
