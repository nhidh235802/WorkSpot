import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedMockData1778069724439 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Hash passwords (all test accounts use '${hash}')
    const hash = await bcrypt.hash('${hash}', 10);

    // --- 1. ID CỐ ĐỊNH ---
    const adminId = '11111111-1111-1111-1111-111111111111';

    // 5 Chủ quán
    const o1 = '22222222-2222-2222-2222-222222222221';
    const o2 = '22222222-2222-2222-2222-222222222222';
    const o3 = '22222222-2222-2222-2222-222222222223';
    const o4 = '22222222-2222-2222-2222-222222222224';
    const o5 = '22222222-2222-2222-2222-222222222225';

    // 5 Khách hàng
    const c1 = '33333333-3333-3333-3333-333333333331';
    const c2 = '33333333-3333-3333-3333-333333333332';
    const c3 = '33333333-3333-3333-3333-333333333333';
    const c4 = '33333333-3333-3333-3333-333333333334';
    const c5 = '33333333-3333-3333-3333-333333333335';

    // 10 Quán Cafe
    const cafeIds = Array.from(
      { length: 10 },
      (_, i) =>
        `44444444-4444-4444-4444-4444444444${(i + 1).toString().padStart(2, '0')}`,
    );

    // =====================================================================
    // 1. THÊM USERS VỚI THÔNG TIN CHI TIẾT
    // =====================================================================
    await queryRunner.query(`
        INSERT INTO "users" ("id", "fullName", "email", "phone", "password", "avatar", "address", "bio", "role") VALUES
        -- 1 Admin
        ('${adminId}', 'Hệ thống WorkSpot', 'admin@workspot.vn', '0999999999', '${hash}', 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff', 'Trụ sở WorkSpot Hà Nội', 'Quản trị viên hệ thống', 'admin'),
        
        -- 5 Chủ quán
        ('${o1}', 'Nguyễn Văn An', 'an.nguyen@owner.vn', '0901111111', '${hash}', 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=random', 'Cầu Giấy, Hà Nội', 'Đam mê kinh doanh F&B và mang đến không gian làm việc lý tưởng.', 'owner'),
        ('${o2}', 'Trần Thị Bích', 'bich.tran@owner.vn', '0902222222', '${hash}', 'https://ui-avatars.com/api/?name=Tran+Thi+Bich&background=random', 'Hoàn Kiếm, Hà Nội', 'Quản lý chuỗi quán cafe phong cách hoài cổ.', 'owner'),
        ('${o3}', 'Lê Hoàng Hải', 'hai.le@owner.vn', '0903333333', '${hash}', 'https://ui-avatars.com/api/?name=Le+Hoang+Hai&background=random', 'Đống Đa, Hà Nội', 'Chuyên gia pha chế, muốn tạo ra văn hóa thưởng thức cà phê mới.', 'owner'),
        ('${o4}', 'Phạm Thị Mai', 'mai.pham@owner.vn', '0904444444', '${hash}', 'https://ui-avatars.com/api/?name=Pham+Thi+Mai&background=random', 'Hai Bà Trưng, Hà Nội', 'Khởi nghiệp với mô hình cafe kết hợp thư viện sách.', 'owner'),
        ('${o5}', 'Vũ Đức Thắng', 'thang.vu@owner.vn', '0905555555', '${hash}', 'https://ui-avatars.com/api/?name=Vu+Duc+Thang&background=random', 'Ba Đình, Hà Nội', 'Mong muốn kết nối cộng đồng Freelancer qua không gian cafe.', 'owner'),
        
        -- 5 Khách hàng
        ('${c1}', 'Đinh Tùng Lâm', 'lam.dinh@gmail.com', '0911111111', '${hash}', 'https://ui-avatars.com/api/?name=Dinh+Tung+Lam&background=random', 'Thanh Xuân, Hà Nội', 'Sinh viên IT đam mê code dạo, chuyên vác laptop ra quán cafe chạy deadline.', 'customer'),
        ('${c2}', 'Hồ Thu Hương', 'huong.ho@gmail.com', '0912222222', '${hash}', 'https://ui-avatars.com/api/?name=Ho+Thu+Huong&background=random', 'Tây Hồ, Hà Nội', 'Freelancer thiết kế đồ họa. Tìm kiếm nguồn cảm hứng từ không gian đẹp.', 'customer'),
        ('${c3}', 'Ngô Văn Nam', 'nam.ngo@gmail.com', '0913333333', '${hash}', 'https://ui-avatars.com/api/?name=Ngo+Van+Nam&background=random', 'Nam Từ Liêm, Hà Nội', 'Nhân viên văn phòng, thường xuyên cần nơi gặp gỡ đối tác.', 'customer'),
        ('${c4}', 'Bùi Thị Lan', 'lan.bui@gmail.com', '0914444444', '${hash}', 'https://ui-avatars.com/api/?name=Bui+Thi+Lan&background=random', 'Hà Đông, Hà Nội', 'Sở thích review quán xá cuối tuần, đam mê chụp ảnh check-in.', 'customer'),
        ('${c5}', 'Đỗ Quang Huy', 'huy.do@gmail.com', '0915555555', '${hash}', 'https://ui-avatars.com/api/?name=Do+Quang+Huy&background=random', 'Hoàng Mai, Hà Nội', 'Remote worker toàn thời gian. Ưu tiên quán có wifi xịn và ghế êm.', 'customer');
    `);

    // =====================================================================
    // 2. THÊM 10 QUÁN CAFE (Avatar quán lấy ảnh placeholder có chứa tên)
    // =====================================================================
    await queryRunner.query(`
        INSERT INTO "cafes" ("id", "name", "description", "address", "latitude", "longitude", "avatar", "images", "facilities", "status", "owner_id") VALUES
        -- Của Chủ quán 1 (Nguyễn Văn An)
        ('${cafeIds[0]}', 'The Coffee House - Cầu Giấy', 'Không gian hiện đại, thích hợp làm việc nhóm.', 'Số 2 Khúc Thừa Dụ, Cầu Giấy, Hà Nội', 21.033333, 105.790580, 'https://placehold.co/600x400?text=TCH+Cau+Giay', '{"https://placehold.co/800x600?text=Khong+gian+1", "https://placehold.co/800x600?text=Menu"}', '{wifi,socket,workspace,desk}', 'approved', '${o1}'),
        ('${cafeIds[1]}', 'Highlands Coffee - Cột Cờ', 'Góc view lịch sử siêu đẹp, đồ uống đậm đà.', '28A Điện Biên Phủ, Ba Đình, Hà Nội', 21.032220, 105.838880, 'https://placehold.co/600x400?text=Highlands+Cot+Co', '{}', '{wifi,cleanliness,snack}', 'approved', '${o1}'),
        
        -- Của Chủ quán 2 (Trần Thị Bích)
        ('${cafeIds[2]}', 'Cộng Cà Phê - Tràng Tiền', 'Phong cách bao cấp độc đáo ngay trung tâm.', '46 Tràng Tiền, Hoàn Kiếm, Hà Nội', 21.025550, 105.852220, 'https://placehold.co/600x400?text=Cong+Trang+Tien', '{}', '{wifi,cleanliness,smoking_rule}', 'approved', '${o2}'),
        ('${cafeIds[3]}', 'Aha Cafe - Tôn Đức Thắng', 'Cafe vỉa hè rộng rãi, thoáng mát.', '212 Tôn Đức Thắng, Đống Đa, Hà Nội', 21.023330, 105.831110, 'https://placehold.co/600x400?text=Aha+Ton+Duc+Thang', '{}', '{wifi,smoking_rule}', 'approved', '${o2}'),
        
        -- Của Chủ quán 3 (Lê Hoàng Hải)
        ('${cafeIds[4]}', 'All Day Coffee - Quang Trung', 'Cà phê rang xay thủ công, không gian Âu Châu.', '37 Quang Trung, Hoàn Kiếm, Hà Nội', 21.024440, 105.848880, 'https://placehold.co/600x400?text=All+Day+Coffee', '{}', '{wifi,socket,workspace,cleanliness}', 'approved', '${o3}'),
        ('${cafeIds[5]}', 'Phúc Long - Vincom Bà Triệu', 'Trà đậm vị, không gian trung tâm thương mại.', '191 Bà Triệu, Hai Bà Trưng, Hà Nội', 21.011110, 105.848880, 'https://placehold.co/600x400?text=Phuc+Long', '{}', '{wifi,snack}', 'approved', '${o3}'),
        
        -- Của Chủ quán 4 (Phạm Thị Mai)
        ('${cafeIds[6]}', 'Kafa Café - Thợ Nhuộm', 'Cafe đường phố mang đậm chất Hà Nội.', '212 Thợ Nhuộm, Hoàn Kiếm, Hà Nội', 21.027770, 105.845550, 'https://placehold.co/600x400?text=Kafa+Tho+Nhuom', '{}', '{wifi,smoking_rule}', 'approved', '${o4}'),
        ('${cafeIds[7]}', 'Tranquil Books & Coffee', 'Cực kỳ yên tĩnh, lý tưởng để đọc sách và code.', '5 Nguyễn Quang Bích, Hoàn Kiếm, Hà Nội', 21.028880, 105.843330, 'https://placehold.co/600x400?text=Tranquil+Books', '{}', '{wifi,socket,workspace,desk,cleanliness}', 'approved', '${o4}'),
        
        -- Của Chủ quán 5 (Vũ Đức Thắng)
        ('${cafeIds[8]}', 'The Note Coffee', 'Quán cafe ngập tràn giấy note dễ thương.', '64 Lương Văn Can, Hoàn Kiếm, Hà Nội', 21.031110, 105.851110, 'https://placehold.co/600x400?text=The+Note+Coffee', '{}', '{wifi,cleanliness}', 'approved', '${o5}'),
        ('${cafeIds[9]}', 'NeoCafe - Lê Đại Hành', 'Ứng dụng công nghệ AI vào pha chế, không gian mở.', '33 Lê Đại Hành, Hai Bà Trưng, Hà Nội', 21.008880, 105.847770, 'https://placehold.co/600x400?text=NeoCafe', '{}', '{wifi,socket,workspace,desk}', 'approved', '${o5}');
    `);

    // =====================================================================
    // 3. THÊM LỊCH HOẠT ĐỘNG (10 quán x 7 ngày = 70 dòng)
    // =====================================================================
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const operatingHoursValues = cafeIds
      .flatMap((cafeId) =>
        days.map(
          (day) =>
            `(uuid_generate_v4(), '${day}', '08:00', '22:30', false, '${cafeId}')`,
        ),
      )
      .join(',\n        ');

    await queryRunner.query(`
        INSERT INTO "operating_hours" ("id", "dayOfWeek", "openTime", "closeTime", "isDayOff", "cafe_id") VALUES
        ${operatingHoursValues};
    `);

    // =====================================================================
    // 4. THÊM 10 BÀI ĐÁNH GIÁ (Mỗi Khách hàng đánh giá 2 Quán)
    // Khách 1 -> Quán 1, Quán 2
    // Khách 2 -> Quán 3, Quán 4
    // Khách 3 -> Quán 5, Quán 6
    // Khách 4 -> Quán 7, Quán 8
    // Khách 5 -> Quán 9, Quán 10
    // =====================================================================
    await queryRunner.query(`
        INSERT INTO "reviews" ("id", "rating", "comment", "user_id", "cafe_id") VALUES
        -- Khách 1 (Lâm - Sinh viên IT) đánh giá Quán 1 & 2
        (uuid_generate_v4(), 5, 'Bàn rộng rãi, ổ cắm đầy đủ, mình ngồi code ở đây 5 tiếng không thấy chán!', '${c1}', '${cafeIds[0]}'),
        (uuid_generate_v4(), 4, 'View nhìn ra Cột Cờ rất chill. Mạng wifi ở mức khá.', '${c1}', '${cafeIds[1]}'),
        
        -- Khách 2 (Hương - Designer) đánh giá Quán 3 & 4
        (uuid_generate_v4(), 5, 'Concept bao cấp của Cộng làm mình nảy ra nhiều idea thiết kế hay ho.', '${c2}', '${cafeIds[2]}'),
        (uuid_generate_v4(), 4, 'Gió mát mẻ, ngồi nhâm nhi bạc xỉu ngắm phố phường rất tuyệt.', '${c2}', '${cafeIds[3]}'),
        
        -- Khách 3 (Nam - NV Văn phòng) đánh giá Quán 5 & 6
        (uuid_generate_v4(), 5, 'Không gian chuyên nghiệp, đối tác của mình rất ưng ý khi họp ở đây.', '${c3}', '${cafeIds[4]}'),
        (uuid_generate_v4(), 5, 'Trà đào cam sả chân ái! Có điều cuối tuần hơi đông ồn ào chút.', '${c3}', '${cafeIds[5]}'),
        
        -- Khách 4 (Lan - Hay chụp ảnh) đánh giá Quán 7 & 8
        (uuid_generate_v4(), 3, 'Cafe phong cách mộc mạc, chụp ảnh film khá hợp.', '${c4}', '${cafeIds[6]}'),
        (uuid_generate_v4(), 5, 'Tranquil đúng như tên gọi, không gian yên tĩnh tuyệt đối, mọi người đều giữ ý tứ.', '${c4}', '${cafeIds[7]}'),
        
        -- Khách 5 (Huy - Remote Worker) đánh giá Quán 9 & 10
        (uuid_generate_v4(), 4, 'Đọc các tờ note của khách hàng trước để lại rất thú vị. Nhân viên thân thiện.', '${c5}', '${cafeIds[8]}'),
        (uuid_generate_v4(), 5, 'Công nghệ đặt món qua app xịn. Bàn làm việc tiêu chuẩn, ghế ngồi rất êm, wifi căng đét!', '${c5}', '${cafeIds[9]}');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "reviews";`);
    await queryRunner.query(`DELETE FROM "operating_hours";`);
    await queryRunner.query(`DELETE FROM "cafes";`);
    await queryRunner.query(`DELETE FROM "users";`);
  }
}
