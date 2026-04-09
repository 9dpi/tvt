/**
 * TVT Community — Cộng đồng Tư Duy Mở
 * Kho dữ liệu: localStorage (offline-first, chia sẻ qua JSON export)
 * Không cần backend. Hoạt động 100% offline.
 */

const COMMUNITY = (() => {
  const STORAGE_KEY = 'tvt_community_posts_v41';
  const MAX_POSTS = 200;

  // ── Seed data (mẫu) ────────────────────────────────────────────────────────
  const SEED_POSTS = [
    {
      id: 'seed-1',
      title: 'Làm thế nào để duy trì thói quen đọc sách mỗi ngày?',
      author: 'Minh Tuấn',
      avatar: '🧠',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Tôi đã thử đọc sách được 2 tháng rồi bỏ liên tục. Vấn đề cốt lõi: thời gian hay ý chí? Theo First Principles, thói quen không tự sinh ra — nó cần một "cái móc" cụ thể trong ngày.',
      tags: ['thói quen', 'đọc sách', 'kỷ luật'],
      votes: 12,
      userVoted: false,
      comments: [
        { author: 'Lan Anh', avatar: '🌸', text: 'Mình gắn việc đọc vào lúc uống cà phê buổi sáng, 2 năm nay không bỏ được!', ts: Date.now() - 3600000 * 24 },
        { author: 'Đức Huy', avatar: '🔥', text: 'Vấn đề là chọn sách đúng cấp độ — quá khó thì não tự từ chối.', ts: Date.now() - 3600000 * 12 },
      ],
      ts: Date.now() - 3600000 * 48,
      status: 'open',
    },
    {
      id: 'seed-2',
      title: 'Quyết định nghỉ việc để học lập trình — Phân tích rủi ro',
      author: 'Bảo Ngọc',
      avatar: '💡',
      method: 'swot',
      methodLabel: 'Phân tích SWOT',
      body: 'Điểm mạnh: Tiết kiệm 1 năm. Điểm yếu: Không có mentor. Cơ hội: Thị trường dev VN đang thiếu. Rủi ro: Không tìm được việc sau 6 tháng. Ai đã trải qua tình huống tương tự?',
      tags: ['career', 'lập trình', 'quyết định lớn'],
      votes: 28,
      userVoted: false,
      comments: [
        { author: 'Phong Vũ', avatar: '⚡', text: 'Mình đã làm vậy năm 2022. Khó nhất là tháng 3-4, nhưng giờ ổn. PM nếu cần hỗ trợ.', ts: Date.now() - 3600000 * 5 },
      ],
      ts: Date.now() - 3600000 * 72,
      status: 'solved',
    },
    {
      id: 'seed-4',
      title: 'Ứng dụng Time Blocking của Elon Musk cho sinh viên',
      author: 'Trung Kiên',
      avatar: '🚀',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Lịch học dày đặc nhưng vẫn thấy xao nhãng. Tôi muốn chia 5 phút cho mỗi nhiệm vụ nhưng thực tế không khả thi. Có ai tối ưu hóa được phương pháp này cho việc học chưa?',
      tags: ['productivity', 'elonmusk', 'study'],
      votes: 15,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 2,
      status: 'open',
    },
    {
      id: 'seed-5',
      title: 'Làm sao để giải quyết mâu thuẫn trong teamwork mà không mất lòng?',
      author: 'Thanh Hà',
      avatar: '🤝',
      method: 'six_hats',
      methodLabel: '6 Chiếc Mũ Tư Duy',
      body: 'Team mình đang cãi nhau về hướng phát triển sản phẩm. Chiếc mũ đỏ (cảm xúc) đang chiếm ưu thế. Làm sao để kéo mọi người về chiếc mũ trắng (dữ liệu)?',
      tags: ['teamwork', 'communication', 'conflict'],
      votes: 9,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 5,
      status: 'open',
    },
    {
      id: 'seed-6',
      title: 'Phân tích "Chi phí cơ hội" khi mua nhà trả góp ở tuổi 25',
      author: 'Hoàng Nam',
      avatar: '🏦',
      method: 'swot',
      methodLabel: 'Phân tích SWOT',
      body: 'Dùng hết tiết kiệm để trả trước 30% và gánh nợ 15 năm. S: Có nhà sớm. W: Áp lực tài chính lớn. O: An cư lạc nghiệp. T: Lãi suất biến động. Có nên đánh đổi tự do?',
      tags: ['finance', 'realestate', 'invest'],
      votes: 34,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 8,
      status: 'open',
    },
    {
      id: 'seed-7',
      title: 'Tại sao quảng cáo Facebook của tôi không ra đơn? (5 Why)',
      author: 'Yến Nhi',
      avatar: '📈',
      method: 'five_why',
      methodLabel: '5 Why (Tại sao × 5)',
      body: 'Chạy 1 triệu/ngày nhưng zero đơn. Tại sao? → Không ai click. Tại sao? → Hình ảnh không hút. Tại sao? → Thiết kế cũ. Tại sao? → Không nghiên cứu trend. Cần cao nhân marketing chỉ giáo.',
      tags: ['marketing', 'ads', 'business'],
      votes: 12,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 10,
      status: 'open',
    },
    {
      id: 'seed-8',
      title: 'Kỹ thuật Feynman để học nhanh một ngôn ngữ lập trình mới',
      author: 'Quốc Anh',
      avatar: '💻',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Đang chuyển từ Java sang Rust. Rust khó quá. Tôi đang cố giải thích Ownership như cho đứa trẻ 10 tuổi nhưng vẫn vấp. Có ví dụ nào đời thường dễ hiểu hơn không?',
      tags: ['learning', 'programming', 'rust'],
      votes: 21,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 14,
      status: 'open',
    },
    {
      id: 'seed-9',
      title: 'Tư duy ngược: Làm thế nào để... thất bại thảm hại khi khởi nghiệp?',
      author: 'Sơn Tùng',
      avatar: '🙃',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Đang dùng Inversion Thinking. Để thất bại: 1. Đốt tiền nhanh. 2. Thuê người dở. 3. Không nghe khách. Từ đây mình sẽ biết cái gì CẦN TRÁNH. Ai bổ sung danh sách "đen" này không?',
      tags: ['startup', 'inversion', 'thinking'],
      votes: 45,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 18,
      status: 'open',
    },
    {
      id: 'seed-10',
      title: 'Phòng tránh burnout cho Freelancer làm việc tại nhà',
      author: 'Hương Ly',
      avatar: '🧘',
      method: 'six_hats',
      methodLabel: '6 Chiếc Mũ Tư Duy',
      body: 'Làm việc 14 tiếng/ngày, không phân biệt giường và bàn làm việc. Cần giải pháp từ chiếc mũ xanh (quản lý) để thiết lập ranh giới mới.',
      tags: ['freelance', 'burnout', 'health'],
      votes: 18,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 22,
      status: 'open',
    },
    {
      id: 'seed-11',
      title: 'Startup SaaS cho thị trường ngách ở Việt Nam — SWOT',
      author: 'Tuấn Đạt',
      avatar: '☁️',
      method: 'swot',
      methodLabel: 'Phân tích SWOT',
      body: 'Phần mềm quản lý tiệm sửa xe máy. O: Hàng triệu tiệm. T: Thói quen dùng sổ ghi chép. Có khả thi để số hóa không hay là "giải pháp đi tìm vấn đề"?',
      tags: ['saas', 'tech', 'vietnam'],
      votes: 7,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 26,
      status: 'open',
    },
    {
      id: 'seed-12',
      title: 'Xây dựng Second Brain với Notion vs Obsidian',
      author: 'Minh Quang',
      avatar: '🧠',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Cần một hệ thống quản lý tri thức lâu dài. Notion đẹp nhưng Obsidian bảo mật và offline. Đâu là "nguyên tử" tối thiểu của một bộ não thứ hai?',
      tags: ['pkm', 'productivity', 'tools'],
      votes: 30,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 30,
      status: 'open',
    },
    {
      id: 'seed-13',
      title: 'Làm sao để bớt trì hoãn khi bắt đầu một dự án lớn?',
      author: 'Diệu Linh',
      avatar: '⏳',
      method: 'five_why',
      methodLabel: '5 Why (Tại sao × 5)',
      body: 'Luôn lau dọn nhà cửa khi cần làm presentation. Tại sao? → Sợ kết quả không tốt. Tại sao? → Áp lực hoàn mỹ. Tại sao? → So sánh với người khác. Cần cách phá vỡ vòng lặp này.',
      tags: ['procrastination', 'psychology', 'focus'],
      votes: 25,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 34,
      status: 'open',
    },
    {
      id: 'seed-14',
      title: 'Có nên học lên Thạc sĩ ở tuổi 30?',
      author: 'Văn Hậu',
      avatar: '🎓',
      method: 'swot',
      methodLabel: 'Phân tích SWOT',
      body: 'Cân nhắc giữa kinh nghiệm thực tế và bằng cấp chuyên sâu. Phân tích SWOT cho thấy T (đe dọa) lớn nhất là mất thu nhập trong 2 năm.',
      tags: ['education', 'career', 'life-choice'],
      votes: 11,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 38,
      status: 'open',
    },
    {
      id: 'seed-15',
      title: 'Chiến lược Marketing 0 đồng cho cửa hàng Handmade',
      author: 'Thùy Chi',
      avatar: '🎨',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Vốn 0 đồng, chỉ có tay nghề. Nguyên lý: Mọi người mua "cảm xúc" chứ không phải món đồ. Làm sao lan tỏa cảm xúc đó trên TikTok hiệu quả nhất?',
      tags: ['marketing', 'handmade', 'smallbusiness'],
      votes: 19,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 42,
      status: 'open',
    },
    {
      id: 'seed-16',
      title: 'Phương pháp Pomodoro có thực sự hiệu quả cho Deep Work?',
      author: 'Khánh An',
      avatar: '🍅',
      method: 'six_hats',
      methodLabel: '6 Chiếc Mũ Tư Duy',
      body: 'Cảm thấy 25 phút là quá ngắn để vào "luồng" (flow). Chiếc mũ vàng (lợi ích) nói nó giữ sức bền, nhưng mũ đen (rủi ro) nói nó ngắt quãng tư duy sâu.',
      tags: ['productivity', 'deepwork', 'focus'],
      votes: 22,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 46,
      status: 'open',
    },
    {
      id: 'seed-17',
      title: 'Đầu tư chứng khoán theo chu kỳ kinh tế — SWOT',
      author: 'Đức Thành',
      avatar: '📈',
      method: 'swot',
      methodLabel: 'Phân tích SWOT',
      body: 'Chu kỳ lãi suất đang đảo chiều. S: Định giá rẻ. W: Thanh khoản thấp. O: Phục hồi GDP. T: Lạm phát quốc tế. Anh em có kế hoạch gì chưa?',
      tags: ['investment', 'finance', 'stocks'],
      votes: 14,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 50,
      status: 'open',
    },
    {
      id: 'seed-18',
      title: 'Tối ưu hóa giấc ngủ bằng tư duy khoa học',
      author: 'Ngọc Mai',
      avatar: '😴',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Ngủ 8 tiếng vẫn mệt. Phân rã nguyên tử: Ánh sáng xanh, nhiệt độ phòng, caffeine. Đâu là biến số quan trọng nhất cần thay đổi đầu tiên?',
      tags: ['health', 'sleep', 'biohacking'],
      votes: 27,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 54,
      status: 'open',
    },
    {
      id: 'seed-19',
      title: 'Phân tích tại sao giới trẻ ngày nay ngại kết hôn?',
      author: 'Anh Thư',
      avatar: '💍',
      method: 'five_why',
      methodLabel: '5 Why (Tại sao × 5)',
      body: 'Trend độc thân đang tăng. Tại sao? → Ưu tiên sự nghiệp. Tại sao? → Áp lực kinh tế. Tại sao? → Giá nhà/sinh hoạt phí quá cao so với thu nhập. Một bài toán xã hội khó giải.',
      tags: ['society', 'marriage', 'psychology'],
      votes: 52,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 58,
      status: 'open',
    },
    {
      id: 'seed-20',
      title: 'Dạy con tư duy phản biện từ sớm như thế nào?',
      author: 'Chị Lan',
      avatar: '🧒',
      method: 'six_hats',
      methodLabel: '6 Chiếc Mũ Tư Duy',
      body: 'Muốn con không chỉ biết vâng lời mà còn biết đặt câu hỏi. Đang thử dùng chiếc mũ trắng để con tự quan sát sự thật trước khi đưa ra ý kiến.',
      tags: ['parenting', 'critical-thinking', 'education'],
      votes: 20,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 62,
      status: 'open',
    },
    {
      id: 'seed-21',
      title: 'Tương lai của AI trong nghệ thuật sáng tạo',
      author: 'Việt Hoàng',
      avatar: '🎨',
      method: 'swot',
      methodLabel: 'Phân tích SWOT',
      body: 'Midjourney/DALL-E đang thay đổi cuộc chơi. O: Tốc độ thiết kế x10. T: Bản quyền và việc làm cho nghệ sĩ truyền thống. Chúng ta đứng ở đâu?',
      tags: ['ai', 'art', 'future'],
      votes: 33,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 66,
      status: 'open',
    },
    {
      id: 'seed-22',
      title: 'Xây dựng thương hiệu cá nhân trên LinkedIn — 5 Why',
      author: 'Phương Thảo',
      avatar: '💼',
      method: 'five_why',
      methodLabel: '5 Why (Tại sao × 5)',
      body: 'Viết bài đều nhưng không có tương tác. Tại sao? → Nội dung khô khan. Tại sao? → Copy-paste lý thuyết. Tại sao? → Thiếu câu chuyện cá nhân/trải nghiệm thực tế.',
      tags: ['branding', 'linkedin', 'networking'],
      votes: 16,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 70,
      status: 'open',
    },
    {
      id: 'seed-23',
      title: 'Sử dụng ChatGPT làm trợ lý học tập hiệu quả',
      author: 'Dương Hiếu',
      avatar: '🤖',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Đừng hỏi "Viết cho tôi...", hãy hỏi "Hãy đóng vai mentor để hướng dẫn tôi...". Chuyển từ thụ động sang chủ động kiến tạo prompt.',
      tags: ['ai', 'learning', 'chatgpt'],
      votes: 29,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 74,
      status: 'open',
    },
    {
      id: 'seed-24',
      title: 'Vấn đề rác thải nhựa tại các điểm du lịch — SWOT',
      author: 'Mai Anh',
      avatar: '🌿',
      method: 'swot',
      methodLabel: 'Phân tích SWOT',
      body: 'S: Ý thức cộng đồng đang tăng. W: Hệ thống xử lý tại chỗ yếu. T: Lượng khách quá tải. Có giải pháp nào bền vững cho đảo nhỏ không?',
      tags: ['environment', 'travel', 'sustainability'],
      votes: 8,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 78,
      status: 'open',
    },
    {
      id: 'seed-25',
      title: 'Bí kíp thuyết trình trước đám đông không run',
      author: 'Trần Long',
      avatar: '🎤',
      method: 'six_hats',
      methodLabel: '6 Chiếc Mũ Tư Duy',
      body: 'Dùng mũ xanh lá (sáng tạo) để biến bài thuyết trình thành một trò chơi tương tác. Giảm bớt mũ đỏ của sự lo lắng bằng cách chuẩn bị mũ trắng kỹ lưỡng.',
      tags: ['public-speaking', 'confidence', 'softskills'],
      votes: 24,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 82,
      status: 'open',
    },
    {
      id: 'seed-26',
      title: 'Áp dụng Minimalist trong quản lý email',
      author: 'Uyên Trang',
      avatar: '📧',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Inbox 5000+. Nguyên lý: Email chỉ là công cụ truyền tin, không phải to-do list. Archive ngay sau khi đọc. Có ai theo trường phái Inbox Zero không?',
      tags: ['minimalism', 'productivity', 'email'],
      votes: 13,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 86,
      status: 'open',
    },
    {
      id: 'seed-27',
      title: 'Tại sao dự án phần mềm thường trễ tiến độ? (5 Why)',
      author: 'Lâm Tech',
      avatar: '🏗️',
      method: 'five_why',
      methodLabel: '5 Why (Tại sao × 5)',
      body: 'Sprint 2 tuần luôn thành 3 tuần. Tại sao? → Phát sinh requirement mới. Tại sao? → Requirement cũ chưa rõ. Tại sao? → Stakeholder chưa biết mình thực sự muốn gì.',
      tags: ['tech', 'agile', 'management'],
      votes: 17,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 90,
      status: 'open',
    },
    {
      id: 'seed-28',
      title: 'Học thiền cho người bận rộn: 3 phút mỗi ngày',
      author: 'Tâm An',
      avatar: '🧘‍♂️',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Không cần ngồi 1 tiếng. Nguyên tử là: Tập trung vào hơi thở bất cứ khi nào có thể. 3 phút lúc chờ xe bus cũng là thiền. Bạn thử chưa?',
      tags: ['meditation', 'mental-health', 'life'],
      votes: 31,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 94,
      status: 'open',
    },
    {
      id: 'seed-29',
      title: 'Cửa hàng tiện lợi vs Chợ truyền thống — SWOT',
      author: 'Bác Sáu',
      avatar: '🛒',
      method: 'swot',
      methodLabel: 'Phân tích SWOT',
      body: 'Phân tích từ góc độ người tiêu dùng nội trợ. S: Chợ rẻ, tươi. W: Nắng nóng, vệ sinh. O: Cửa hàng 24/7 tiện lợi. T: Giá cao hơn chút.',
      tags: ['retail', 'lifestyle', 'economic'],
      votes: 6,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 98,
      status: 'open',
    },
    {
      id: 'seed-30',
      title: 'Lợi ích của việc viết lách hàng ngày (Journaling)',
      author: 'Ánh Tuyết',
      avatar: '📔',
      method: 'six_hats',
      methodLabel: '6 Chiếc Mũ Tư Duy',
      body: 'Mũ trắng ghi lại sự kiện. Mũ đỏ xả stress. Mũ xanh dương tổng kết bài học. Viết lách là cách để "backup" trí não hiệu quả nhất.',
      tags: ['journaling', 'writing', 'self-help'],
      votes: 38,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 102,
      status: 'open',
    },
    {
      id: 'seed-31',
      title: 'Làm thế nào để duy trì niềm đam mê sau 5 năm làm nghề?',
      author: 'Lê Minh',
      avatar: '🔥',
      method: 'five_why',
      methodLabel: '5 Why (Tại sao × 5)',
      body: 'Cảm thấy chán việc. Tại sao? → Không còn gì mới để học. Tại sao? → Quanh quẩn task lặp lại. Tại sao? → Không nhận dự án thách thức hơn. Đã đến lúc thay đổi?',
      tags: ['career', 'passion', 'worklife'],
      votes: 23,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 106,
      status: 'open',
    },
    {
      id: 'seed-32',
      title: 'Tư duy First Principles trong việc tối ưu hóa chi phí gia đình',
      author: 'Anh Dũng',
      avatar: '🏠',
      method: 'first_principles',
      methodLabel: 'Tư duy Nguyên lý Cơ bản',
      body: 'Thu nhập giảm, cần thắt lưng buộc bụng. Phân rã: Ăn uống, điện nước, giải trí. Nấu ăn tại nhà tiết kiệm được 60% so với ăn ngoài. Bạn cắt giảm cái gì đầu tiên?',
      tags: ['finance', 'family', 'saving'],
      votes: 21,
      userVoted: false,
      comments: [],
      ts: Date.now() - 3600000 * 110,
      status: 'open',
    },
  ];

  // ── Core storage ────────────────────────────────────────────────────────────
  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function _save(posts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.slice(0, MAX_POSTS)));
    } catch (e) { console.warn('Community storage full:', e); }
  }

  function getPosts() {
    let posts = _load();
    if (!posts) {
      posts = SEED_POSTS;
      _save(posts);
    }
    return posts.sort((a, b) => b.ts - a.ts); // Newest first
  }

  function getPost(id) {
    return getPosts().find(p => p.id === id);
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────
  function createPost({ title, body, author, avatar, method, methodLabel, tags }) {
    const posts = getPosts();
    const post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      body: body.trim(),
      author: author || 'Ẩn danh',
      avatar: avatar || '👤',
      method: method || '',
      methodLabel: methodLabel || '',
      tags: (tags || []).filter(Boolean),
      votes: 0,
      userVoted: false,
      comments: [],
      ts: Date.now(),
      status: 'open',
    };
    posts.unshift(post);
    _save(posts);
    return post;
  }

  function vote(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;
    post.userVoted = !post.userVoted;
    post.votes = post.userVoted ? post.votes + 1 : Math.max(0, post.votes - 1);
    _save(posts);
    return post;
  }

  function addComment(postId, { author, avatar, text }) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post || !text.trim()) return null;
    post.comments.push({
      author: author || 'Ẩn danh',
      avatar: avatar || '👤',
      text: text.trim(),
      ts: Date.now(),
    });
    _save(posts);
    return post;
  }

  function markSolved(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;
    post.status = post.status === 'solved' ? 'open' : 'solved';
    _save(posts);
    return post;
  }

  function deletePost(postId) {
    const posts = getPosts().filter(p => p.id !== postId);
    _save(posts);
  }

  // ── Import / Export ─────────────────────────────────────────────────────────
  function exportJSON() {
    const blob = new Blob([JSON.stringify(getPosts(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tvt_community_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) throw new Error('Invalid format');
          const existing = getPosts();
          const existingIds = new Set(existing.map(p => p.id));
          const newPosts = imported.filter(p => p.id && !existingIds.has(p.id));
          const merged = [...existing, ...newPosts].sort((a, b) => b.ts - a.ts);
          _save(merged);
          resolve(newPosts.length);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  return { getPosts, getPost, createPost, vote, addComment, markSolved, deletePost, exportJSON, importJSON };
})();


// ── UI Renderer ─────────────────────────────────────────────────────────────
const CommunityUI = {
  _activePostId: null,

  init() {
    this.bindToolbar();
    this.render();
  },

  // ── Toolbar buttons ─────────────────────────────────────────────────────────
  bindToolbar() {
    document.getElementById('comm-btn-new')?.addEventListener('click', () => this.openNewPostModal());
    document.getElementById('comm-btn-export')?.addEventListener('click', () => COMMUNITY.exportJSON());
    document.getElementById('comm-btn-import')?.addEventListener('click', () => {
      document.getElementById('comm-import-file')?.click();
    });
    document.getElementById('comm-import-file')?.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const count = await COMMUNITY.importJSON(file);
        App.showToast(`✅ Đã nhập ${count} bài viết mới từ file!`);
        this.render();
      } catch { App.showToast('❌ File không hợp lệ!'); }
      e.target.value = '';
    });
    document.getElementById('comm-search')?.addEventListener('input', e => {
      this.render(e.target.value.trim().toLowerCase());
    });
    document.getElementById('comm-filter')?.addEventListener('change', e => {
      this.render(document.getElementById('comm-search')?.value.trim().toLowerCase(), e.target.value);
    });
  },

  // ── Main feed render ────────────────────────────────────────────────────────
  render(query = '', filter = 'all') {
    const feed = document.getElementById('community-feed');
    if (!feed) return;

    let posts = COMMUNITY.getPosts();

    // Search filter
    if (query) {
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.body.toLowerCase().includes(query) ||
        (p.tags || []).some(t => t.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filter === 'open') posts = posts.filter(p => p.status !== 'solved');
    if (filter === 'solved') posts = posts.filter(p => p.status === 'solved');

    if (posts.length === 0) {
      feed.innerHTML = `<div class="comm-empty">🔍 Không tìm thấy bài viết nào.<br><small>Hãy là người đầu tiên đặt câu hỏi!</small></div>`;
      return;
    }

    feed.innerHTML = '';
    posts.forEach(p => feed.appendChild(this._buildCard(p)));
  },

  _buildCard(post) {
    const div = document.createElement('div');
    div.className = `comm-card ${post.status === 'solved' ? 'comm-card--solved' : ''} ${this._activePostId === post.id ? 'comm-card--active' : ''}`;
    div.dataset.postId = post.id;

    const timeAgo = this._timeAgo(post.ts);
    const tagsHtml = (post.tags || []).map(t => `<span class="comm-tag">#${t}</span>`).join('');
    const statusBadge = post.status === 'solved'
      ? '<span class="comm-badge comm-badge--solved">✅ Đã giải quyết</span>'
      : '<span class="comm-badge comm-badge--open">🔴 Đang thảo luận</span>';

    div.innerHTML = `
      <div class="comm-card-header">
        <span class="comm-avatar">${post.avatar}</span>
        <div class="comm-meta">
          <strong class="comm-author">${this._esc(post.author)}</strong>
          <span class="comm-time">${timeAgo}</span>
        </div>
        ${statusBadge}
      </div>
      <div class="comm-card-title">${this._esc(post.title)}</div>
      <div class="comm-card-body">${this._esc(post.body)}</div>
      ${post.methodLabel ? `<div class="comm-method-tag">📋 ${this._esc(post.methodLabel)}</div>` : ''}
      ${tagsHtml ? `<div class="comm-tags">${tagsHtml}</div>` : ''}
      <div class="comm-card-footer">
        <button class="comm-vote-btn ${post.userVoted ? 'voted' : ''}" data-id="${post.id}" title="Ủng hộ">
          ▲ <span class="vote-count">${post.votes}</span>
        </button>
        <button class="comm-comment-btn" data-id="${post.id}" title="Xem & Bình luận">
          💬 ${post.comments.length}
        </button>
        <button class="comm-solve-btn" data-id="${post.id}" title="${post.status === 'solved' ? 'Mở lại' : 'Đánh dấu đã giải quyết'}">
          ${post.status === 'solved' ? '🔓 Mở lại' : '✅ Giải quyết'}
        </button>
      </div>
    `;

    // Bind inline events
    div.querySelector('.comm-vote-btn').onclick = (e) => {
      e.stopPropagation();
      COMMUNITY.vote(post.id);
      this.render(
        document.getElementById('comm-search')?.value.trim().toLowerCase(),
        document.getElementById('comm-filter')?.value
      );
    };
    div.querySelector('.comm-comment-btn').onclick = (e) => {
      e.stopPropagation();
      this._activePostId = post.id;
      this.openThread(post.id);
    };
    div.querySelector('.comm-solve-btn').onclick = (e) => {
      e.stopPropagation();
      COMMUNITY.markSolved(post.id);
      this.render(
        document.getElementById('comm-search')?.value.trim().toLowerCase(),
        document.getElementById('comm-filter')?.value
      );
    };

    return div;
  },

  // ── Thread / Comments Modal ─────────────────────────────────────────────────
  openThread(postId) {
    const post = COMMUNITY.getPost(postId);
    if (!post) return;

    let modal = document.getElementById('comm-thread-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'comm-thread-modal';
      modal.className = 'comm-modal-overlay';
      document.body.appendChild(modal);
    }

    const commentsHtml = post.comments.length
      ? post.comments.map(c => `
        <div class="comm-comment">
          <span class="comm-avatar-sm">${c.avatar}</span>
          <div class="comm-comment-body">
            <strong>${this._esc(c.author)}</strong>
            <span class="comm-comment-time">${this._timeAgo(c.ts)}</span>
            <p>${this._esc(c.text)}</p>
          </div>
        </div>`).join('')
      : '<div class="comm-no-comments">Chưa có góp ý nào. Hãy là người đầu tiên!</div>';

    modal.innerHTML = `
      <div class="comm-modal">
        <div class="comm-modal-header">
          <span>${post.avatar} <strong>${this._esc(post.author)}</strong></span>
          <button class="comm-modal-close" id="comm-modal-close-btn">✕</button>
        </div>
        <div class="comm-modal-title">${this._esc(post.title)}</div>
        <div class="comm-modal-body-text">${this._esc(post.body)}</div>
        ${post.methodLabel ? `<div class="comm-method-tag" style="margin:6px 0;">📋 ${this._esc(post.methodLabel)}</div>` : ''}
        <div class="comm-comments-section">
          <div class="comm-comments-label">💬 Góp ý từ cộng đồng (${post.comments.length})</div>
          <div id="comm-comments-list">${commentsHtml}</div>
        </div>
        <div class="comm-reply-area">
          <input id="comm-reply-author" type="text" placeholder="Tên của bạn (tuỳ chọn)" class="comm-reply-input comm-reply-author" maxlength="40">
          <textarea id="comm-reply-text" placeholder="Chia sẻ góc nhìn, kinh nghiệm hoặc câu hỏi của bạn..." class="comm-reply-textarea" rows="3" maxlength="800"></textarea>
          <button id="comm-reply-submit" class="comm-reply-btn">📤 Gửi góp ý</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('comm-modal-close-btn').onclick = () => {
      modal.style.display = 'none';
      this._activePostId = null;
    };
    modal.onclick = (e) => { if (e.target === modal) { modal.style.display = 'none'; this._activePostId = null; } };

    document.getElementById('comm-reply-submit').onclick = () => {
      const author = document.getElementById('comm-reply-author').value.trim();
      const text = document.getElementById('comm-reply-text').value.trim();
      if (!text) { App.showToast('Vui lòng nhập nội dung góp ý!'); return; }
      COMMUNITY.addComment(postId, { author, avatar: this._genAvatar(author), text });
      App.showToast('✅ Đã gửi góp ý!');
      this.render(
        document.getElementById('comm-search')?.value.trim().toLowerCase(),
        document.getElementById('comm-filter')?.value
      );
      this.openThread(postId); // Refresh thread
    };
  },

  // ── New Post Modal ──────────────────────────────────────────────────────────
  openNewPostModal() {
    let modal = document.getElementById('comm-new-post-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'comm-new-post-modal';
      modal.className = 'comm-modal-overlay';
      document.body.appendChild(modal);
    }

    const methods = Object.entries(TVT_MODELS || {}).map(([k, m]) =>
      `<option value="${k}|${m.name}">${m.icon} ${m.name}</option>`).join('');

    modal.innerHTML = `
      <div class="comm-modal comm-modal--new">
        <div class="comm-modal-header">
          <strong>📝 Đặt câu hỏi cho Cộng đồng</strong>
          <button class="comm-modal-close" id="comm-new-close-btn">✕</button>
        </div>
        <div class="comm-new-form">
          <label>Tên của bạn</label>
          <input id="new-post-author" type="text" placeholder="Ví dụ: Minh Tuấn" class="comm-form-input" maxlength="60">

          <label>Tiêu đề vấn đề <span style="color:#c00">*</span></label>
          <input id="new-post-title" type="text" placeholder="Vấn đề của bạn là gì? (Ngắn gọn, rõ ràng)" class="comm-form-input" maxlength="120">

          <label>Mô tả chi tiết <span style="color:#c00">*</span></label>
          <textarea id="new-post-body" placeholder="Bối cảnh, những gì bạn đã thử, điều bạn cần từ cộng đồng..." class="comm-form-textarea" rows="5" maxlength="1200"></textarea>

          <label>Phương pháp tư duy áp dụng</label>
          <select id="new-post-method" class="comm-form-input">
            <option value="">-- Chọn phương pháp (tuỳ chọn) --</option>
            ${methods}
          </select>

          <label>Tags (phân cách bằng dấu phẩy)</label>
          <input id="new-post-tags" type="text" placeholder="ví dụ: công việc, quyết định, học hỏi" class="comm-form-input" maxlength="100">

          <div class="comm-form-char-count"><span id="new-post-char">0</span>/1200 ký tự</div>
          <button id="comm-post-submit-btn" class="comm-reply-btn comm-reply-btn--primary">🚀 Chia sẻ với cộng đồng</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('comm-new-close-btn').onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    const bodyEl = document.getElementById('new-post-body');
    bodyEl?.addEventListener('input', () => {
      document.getElementById('new-post-char').textContent = bodyEl.value.length;
    });

    document.getElementById('comm-post-submit-btn').onclick = () => {
      const title = document.getElementById('new-post-title').value.trim();
      const body = document.getElementById('new-post-body').value.trim();
      const author = document.getElementById('new-post-author').value.trim();
      const methodRaw = document.getElementById('new-post-method').value;
      const tagsRaw = document.getElementById('new-post-tags').value;

      if (!title) { App.showToast('⚠️ Vui lòng nhập tiêu đề vấn đề!'); return; }
      if (body.length < 20) { App.showToast('⚠️ Mô tả quá ngắn, hãy chia sẻ thêm chi tiết nhé!'); return; }

      const [method = '', methodLabel = ''] = methodRaw.split('|');
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

      COMMUNITY.createPost({ title, body, author, avatar: this._genAvatar(author), method, methodLabel, tags });
      modal.style.display = 'none';
      App.showToast('✅ Đã chia sẻ vấn đề của bạn với cộng đồng!');
      this.render();
    };
  },

  // ── Helpers ─────────────────────────────────────────────────────────────────
  _esc(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  _timeAgo(ts) {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'vừa xong';
    if (min < 60) return `${min} phút trước`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  },

  _genAvatar(name) {
    const pool = ['👤', '🧠', '💡', '🔥', '⚡', '🌿', '🎯', '🏆', '🌸', '🦁'];
    if (!name) return '👤';
    return pool[name.charCodeAt(0) % pool.length];
  },
};
