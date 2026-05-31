import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedMockData1778069724439 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    const hash = await bcrypt.hash('123456', 10);

    // --- 1. ID CỐ ĐỊNH ---
    const adminId = '11111111-1111-1111-1111-111111111111';

    // 5 Chủ quán + 1 Tester
    const o1 = '22222222-2222-2222-2222-222222222221';
    const o2 = '22222222-2222-2222-2222-222222222222';
    const o3 = '22222222-2222-2222-2222-222222222223';
    const o4 = '22222222-2222-2222-2222-222222222224';
    const o5 = '22222222-2222-2222-2222-222222222225';
    const o6 = '22222222-2222-2222-2222-222222222226';

    // 5 Khách hàng
    const c1 = '33333333-3333-3333-3333-333333333331';
    const c2 = '33333333-3333-3333-3333-333333333332';
    const c3 = '33333333-3333-3333-3333-333333333333';
    const c4 = '33333333-3333-3333-3333-333333333334';
    const c5 = '33333333-3333-3333-3333-333333333335';

    // 30 Quán Cafe
    const cafeIds = Array.from(
      { length: 30 },
      (_, i) =>
        `44444444-4444-4444-4444-4444444444${(i + 1).toString().padStart(2, '0')}`,
    );

    // =====================================================================
    // 1. THÊM USERS VỚI THÔNG TIN CHI TIẾT
    // =====================================================================
    await queryRunner.query(`
        INSERT INTO "users" ("id", "fullName", "email", "phone", "password", "avatar", "address", "bio", "role") VALUES
        -- 1 Admin
        ('${adminId}', 'Hệ thống WorkSpot', 'admin@workspot.vn', '0999999999', '${hash}', NULL, 'Trụ sở WorkSpot Hà Nội', 'Quản trị viên hệ thống', 'admin'),
        
        -- 5 Chủ quán
        ('${o1}', 'Nguyễn Văn An', 'an.nguyen@owner.vn', '0901111111', '${hash}', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Cầu Giấy, Hà Nội', 'Đam mê kinh doanh F&B.', 'owner'),
        ('${o2}', 'Trần Thị Bích', 'bich.tran@owner.vn', '0902222222', '${hash}', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'Hoàn Kiếm, Hà Nội', 'Quản lý chuỗi quán cafe hoài cổ.', 'owner'),
        ('${o3}', 'Lê Hoàng Hải', 'hai.le@owner.vn', '0903333333', '${hash}', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'Đống Đa, Hà Nội', 'Chuyên gia pha chế.', 'owner'),
        ('${o4}', 'Phạm Thị Mai', 'mai.pham@owner.vn', '0904444444', '${hash}', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Hai Bà Trưng, Hà Nội', 'Cafe kết hợp thư viện sách.', 'owner'),
        ('${o5}', 'Vũ Đức Thắng', 'thang.vu@owner.vn', '0905555555', '${hash}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Ba Đình, Hà Nội', 'Freelancer Connector.', 'owner'),
        -- Chủ quán Test (Vĩnh Yên)
        ('${o6}', 'Vĩnh Yên Tester', 'vinhyen@owner.vn', '0906666666', '${hash}', NULL, 'Vĩnh Yên, Vĩnh Phúc', 'GPS Tester.', 'owner'),

        -- 5 Khách hàng
        ('${c1}', 'Đinh Tùng Lâm', 'lam.dinh@gmail.com', '0911111111', '${hash}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Thanh Xuân, Hà Nội', 'Sinh viên IT chạy deadline.', 'customer'),
        ('${c2}', 'Hồ Thu Hương', 'huong.ho@gmail.com', '0912222222', '${hash}', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Tây Hồ, Hà Nội', 'Freelancer Designer.', 'customer'),
        ('${c3}', 'Ngô Văn Nam', 'nam.ngo@gmail.com', '0913333333', '${hash}', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400', 'Nam Từ Liêm, Hà Nội', 'NV Văn phòng.', 'customer'),
        ('${c4}', 'Bùi Thị Lan', 'lan.bui@gmail.com', '0914444444', '${hash}', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'Hà Đông, Hà Nội', 'Đam mê review check-in.', 'customer'),
        ('${c5}', 'Đỗ Quang Huy', 'huy.do@gmail.com', '0915555555', '${hash}', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'Hoàng Mai, Hà Nội', 'Remote Worker.', 'customer');
    `);

    // =====================================================================
    // GALLERY CONSTANTS - Chỉ dùng photo ID đã verify là ảnh cafe/coffee
    // =====================================================================
    const G_Modern_1 =
      '{"https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Modern_2 =
      '{"https://images.unsplash.com/photo-1612192527395-06b72da6b35a?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1648462908676-8305f0eff8e0?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop"}';
    const G_Modern_3 =
      '{"https://images.unsplash.com/photo-1648462908676-8305f0eff8e0?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472205-16284618a54e?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop"}';
    const G_Garden_1 =
      '{"https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472205-16284618a54e?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop"}';
    const G_Garden_2 =
      '{"https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472205-16284618a54e?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop"}';
    const G_Vintage_1 =
      '{"https://images.unsplash.com/photo-1501339817309-1d41e50156af?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1559925313-8a5664d6db87?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1463797221720-6b07e6426c24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop"}';
    const G_Vintage_2 =
      '{"https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1501339817309-1d41e50156af?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1463797221720-6b07e6426c24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1559925313-8a5664d6db87?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Cozy_1 =
      '{"https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1507133750070-4cb655bf51c6?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1529606132049-555e71dd6ee5?w=800&q=80&auto=format&fit=crop"}';
    const G_Cozy_2 =
      '{"https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1507133750070-4cb655bf51c6?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1529606132049-555e71dd6ee5?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80&auto=format&fit=crop"}';
    const G_Cozy_3 =
      '{"https://images.unsplash.com/photo-1507133750070-4cb655bf51c6?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Luxury_1 =
      '{"https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop"}';
    const G_Luxury_2 =
      '{"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472205-16284618a54e?w=800&q=80&auto=format&fit=crop"}';
    const G_Work_1 =
      '{"https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Work_2 =
      '{"https://images.unsplash.com/photo-1588253137728-1e4dd0fe9a93?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop"}';

    // =====================================================================
    // CAFE INSERT - avatar = ảnh đầu tiên của gallery
    // =====================================================================
    await queryRunner.query(`
            INSERT INTO "cafes" ("id", "name", "description", "address", "latitude", "longitude", "avatar", "images", "facilities", "status", "rejectionReason", "realtimeStatus", "owner_id") VALUES

            -- ===================== OWNER 1 (o1) =====================
            ('${cafeIds[0]}', 'The Coffee House - Cầu Giấy',
            'Không gian hiện đại, thích hợp làm việc nhóm.',
            'Số 2 Khúc Thừa Dụ, Cầu Giấy, Hà Nội', 21.033333, 105.790580,
            'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_1}', '{wifi,socket,workspace,desk}', 'approved', NULL, 'busy', '${o1}'),

            ('${cafeIds[1]}', 'Highlands Coffee - Cột Cờ',
            'Góc view lịch sử siêu đẹp, đồ uống đậm đà.',
            '28A Điện Biên Phủ, Ba Đình, Hà Nội', 21.032220, 105.838880,
            'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_1}', '{wifi,cleanliness,snack}', 'pending', NULL, 'normal', '${o1}'),

            ('${cafeIds[11]}', 'Katinat Saigon Kafe - Lý Thường Kiệt',
            'Thương hiệu đình đám nay đã có mặt tại Hà Nội.',
            '60 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', 21.023810, 105.845620,
            'https://images.unsplash.com/photo-1612192527395-06b72da6b35a?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_2}', '{wifi,cleanliness}', 'approved', NULL, 'busy', '${o1}'),

            ('${cafeIds[12]}', 'Gờ Cafe - Nguyễn Trãi',
            'Cà phê rang xay nguyên chất, chỗ ngồi siêu êm.',
            '123 Nguyễn Trãi, Thanh Xuân, Hà Nội', 20.998980, 105.811560,
            'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_1}', '{wifi,socket}', 'approved', NULL, 'normal', '${o1}'),

            ('${cafeIds[13]}', 'Maison Marou - Thợ Nhuộm',
            'Thiên đường socola và bánh ngọt.',
            '91A Thợ Nhuộm, Hoàn Kiếm, Hà Nội', 21.026410, 105.845650,
            'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_1}', '{wifi,snack,cleanliness}', 'rejected', 'Vui lòng cung cấp thêm hình ảnh mặt tiền.', 'normal', '${o1}'),

            -- ===================== OWNER 2 (o2) =====================
            ('${cafeIds[2]}', 'Cộng Cà Phê - Tràng Tiền',
            'Phong cách bao cấp độc đáo.',
            '46 Tràng Tiền, Hoàn Kiếm, Hà Nội', 21.025550, 105.852220,
            'https://images.unsplash.com/photo-1501339817309-1d41e50156af?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_1}', '{wifi,cleanliness,smoking_rule}', 'rejected', 'Hình ảnh mờ, địa chỉ không khớp giấy phép.', 'normal', '${o2}'),

            ('${cafeIds[3]}', 'Aha Cafe - Tôn Đức Thắng',
            'Cafe vỉa hè rộng rãi, thoáng mát.',
            '212 Tôn Đức Thắng, Đống Đa, Hà Nội', 21.023330, 105.831110,
            'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_2}', '{wifi,smoking_rule}', 'approved', NULL, 'available', '${o2}'),

            ('${cafeIds[14]}', 'RuNam Bistro - Nhà Thờ',
            'Phong cách Indochine sang trọng.',
            '13 Nhà Thờ, Hoàn Kiếm, Hà Nội', 21.028630, 105.849210,
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_2}', '{wifi,snack,cleanliness}', 'pending', NULL, 'normal', '${o2}'),

            ('${cafeIds[15]}', 'Trung Nguyên Legend - Hai Bà Trưng',
            'Hương vị cà phê năng lượng đặc trưng.',
            '52 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', 21.024560, 105.849760,
            'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_2}', '{wifi,socket,workspace}', 'approved', NULL, 'busy', '${o2}'),

            ('${cafeIds[16]}', 'Đinh Cafe - Đinh Tiên Hoàng',
            'Cà phê trứng huyền thoại phố cổ.',
            '13 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', 21.031310, 105.853060,
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_2}', '{wifi}', 'approved', NULL, 'busy', '${o2}'),

            -- ===================== OWNER 3 (o3) =====================
            ('${cafeIds[4]}', 'All Day Coffee - Quang Trung',
            'Cà phê rang xay thủ công, không gian Âu Châu.',
            '37 Quang Trung, Hoàn Kiếm, Hà Nội', 21.024440, 105.848880,
            'https://images.unsplash.com/photo-1507133750070-4cb655bf51c6?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_3}', '{wifi,socket,workspace,cleanliness}', 'approved', NULL, 'normal', '${o3}'),

            ('${cafeIds[5]}', 'Phúc Long - Vincom Bà Triệu',
            'Trà đậm vị, không gian trung tâm thương mại.',
            '191 Bà Triệu, Hai Bà Trưng, Hà Nội', 21.011110, 105.848880,
            'https://images.unsplash.com/photo-1648462908676-8305f0eff8e0?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_3}', '{wifi,snack}', 'pending', NULL, 'normal', '${o3}'),

            ('${cafeIds[17]}', 'The Running Bean - Hàng Bạc',
            'Không gian cực xịn xò nhìn ra phố cổ.',
            '22 Hàng Bạc, Hoàn Kiếm, Hà Nội', 21.033560, 105.852440,
            'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_1}', '{wifi,socket,cleanliness}', 'approved', NULL, 'available', '${o3}'),

            ('${cafeIds[18]}', 'Blackbird Coffee - Chân Cầm',
            'Specialty coffee cho dân sành điệu.',
            '5 Chân Cầm, Hoàn Kiếm, Hà Nội', 21.029850, 105.847120,
            'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_2}', '{wifi,workspace}', 'approved', NULL, 'busy', '${o3}'),

            ('${cafeIds[19]}', 'Serein Cafe & Lounge - Trần Nhật Duật',
            'View cầu Long Biên check-in triệu like.',
            '16 Trần Nhật Duật, Hà Nội', 21.038890, 105.852580,
            'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_1}', '{wifi,smoking_rule}', 'hidden', 'Quán đang bảo trì nâng cấp thang máy.', 'normal', '${o3}'),

            -- ===================== OWNER 4 (o4) =====================
            ('${cafeIds[6]}', 'Kafa Café - Thợ Nhuộm',
            'Cafe đường phố mang đậm chất Hà Nội.',
            '212 Thợ Nhuộm, Hoàn Kiếm, Hà Nội', 21.027770, 105.845550,
            'https://images.unsplash.com/photo-1501339817309-1d41e50156af?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_1}', '{wifi,smoking_rule}', 'approved', NULL, 'busy', '${o4}'),

            ('${cafeIds[7]}', 'Tranquil Books & Coffee',
            'Cực kỳ yên tĩnh, lý tưởng để đọc sách.',
            '5 Nguyễn Quang Bích, Hoàn Kiếm, Hà Nội', 21.028880, 105.843330,
            'https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=600&q=80&auto=format&fit=crop',
            '${G_Work_1}', '{wifi,socket,workspace,desk,cleanliness}', 'approved', NULL, 'available', '${o4}'),

            ('${cafeIds[20]}', 'Lofita - Phố Huế',
            'Trà chiều phong cách lãng mạn.',
            'Tầng 9, 338 Phố Huế, Hà Nội', 21.011880, 105.851210,
            'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_1}', '{wifi,cleanliness,snack}', 'approved', NULL, 'normal', '${o4}'),

            ('${cafeIds[21]}', 'Laika Cafe - Ngã Tư Sở',
            'View ngã tư thoáng đãng.',
            '1 Ngã Tư Sở, Đống Đa, Hà Nội', 21.002880, 105.818310,
            'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_1}', '{wifi,socket,flexible_hours}', 'pending', NULL, 'normal', '${o4}'),

            ('${cafeIds[22]}', 'Cheese Coffee - Lê Đại Hành',
            'Cà phê kem phô mai trứ danh.',
            '50 Lê Đại Hành, Hà Nội', 21.011220, 105.849110,
            'https://images.unsplash.com/photo-1612192527395-06b72da6b35a?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_2}', '{wifi,socket,cleanliness}', 'approved', NULL, 'busy', '${o4}'),

            ('${cafeIds[23]}', 'Phê La - Phạm Ngọc Thạch',
            'Trà Ô Long đậm vị Lâm Đồng.',
            '2 Tôn Thất Tùng, Hà Nội', 21.005780, 105.831510,
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_2}', '{wifi,snack}', 'approved', NULL, 'busy', '${o4}'),

            -- ===================== OWNER 5 (o5) =====================
            ('${cafeIds[8]}', 'The Note Coffee',
            'Quán cafe ngập tràn giấy note dễ thương.',
            '64 Lương Văn Can, Hà Nội', 21.031110, 105.851110,
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_2}', '{wifi,cleanliness}', 'approved', NULL, 'normal', '${o5}'),

            ('${cafeIds[9]}', 'NeoCafe - Lê Đại Hành',
            'Pha chế công nghệ AI, không gian mở.',
            '33 Lê Đại Hành, Hà Nội', 21.008880, 105.847770,
            'https://images.unsplash.com/photo-1648462908676-8305f0eff8e0?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_3}', '{wifi,socket,workspace,desk}', 'approved', NULL, 'busy', '${o5}'),

            ('${cafeIds[24]}', 'Twitter Beans Coffee - Duy Tân',
            'Điểm hẹn lý tưởng dân văn phòng.',
            'Tòa nhà CMC, Cầu Giấy, Hà Nội', 21.030510, 105.782810,
            'https://images.unsplash.com/photo-1588253137728-1e4dd0fe9a93?w=600&q=80&auto=format&fit=crop',
            '${G_Work_2}', '{wifi,socket,workspace}', 'approved', NULL, 'available', '${o5}'),

            ('${cafeIds[25]}', 'Highlands Coffee - Hoàng Đạo Thúy',
            'Khu trung tâm sầm uất, view kính.',
            'N04 Hoàng Đạo Thúy, Hà Nội', 21.008210, 105.801610,
            'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_2}', '{wifi,cleanliness,snack}', 'approved', NULL, 'normal', '${o5}'),

            ('${cafeIds[26]}', 'Cộng Cà Phê - Hồ Gươm',
            'Ngắm trọn tháp Rùa thơ mộng.',
            '116 Cầu Gỗ, Hà Nội', 21.031610, 105.852110,
            'https://images.unsplash.com/photo-1501339817309-1d41e50156af?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_1}', '{wifi,smoking_rule}', 'approved', NULL, 'busy', '${o5}'),

            ('${cafeIds[27]}', 'Aha Cafe - Nguyễn Văn Cừ',
            'Thoáng mát, vỉa hè to.',
            '154 Nguyễn Văn Cừ, Long Biên, Hà Nội', 21.045110, 105.871110,
            'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_1}', '{wifi}', 'rejected', 'Ảnh chụp không rõ khu vực làm việc.', 'normal', '${o5}'),

            ('${cafeIds[28]}', 'Kafa - Trần Phú',
            'Không gian cổ kính, mát mẻ.',
            '15 Trần Phú, Ba Đình, Hà Nội', 21.031210, 105.839110,
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_2}', '{wifi,smoking_rule}', 'approved', NULL, 'available', '${o5}'),

            -- ===================== OWNER 6 (o6 - Vĩnh Yên) =====================
            ('${cafeIds[10]}', 'WorkSpot Vĩnh Yên',
            'Quán cafe yên tĩnh ngay trung tâm thành phố.',
            'Vĩnh Yên, Vĩnh Phúc', 21.315540, 105.626900,
            'https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=600&q=80&auto=format&fit=crop',
            '${G_Work_1}', '{wifi,socket,workspace,desk,cleanliness}', 'approved', NULL, 'available', '${o6}'),

            ('${cafeIds[29]}', 'WorkSpot Tam Đảo',
            'Gió núi mây ngàn mát lạnh.',
            'Thị trấn Tam Đảo, Vĩnh Phúc', 21.458900, 105.648100,
            'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_1}', '{wifi}', 'pending', NULL, 'normal', '${o6}')
        `);

    // =====================================================================
    // 3. THÊM LỊCH HOẠT ĐỘNG (30 quán x 7 ngày = 210 dòng)
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
    // 4. THÊM BÀI ĐÁNH GIÁ (Rải rác khoảng 20 review)
    // =====================================================================
    await queryRunner.query(`
        INSERT INTO "reviews" ("id", "rating", "comment", "user_id", "cafe_id") VALUES
        -- Khách 1
        (uuid_generate_v4(), 5, 'Bàn rộng, code cả ngày!', '${c1}', '${cafeIds[0]}'),
        (uuid_generate_v4(), 4, 'View nhìn ra Cột Cờ rất chill.', '${c1}', '${cafeIds[1]}'),
        (uuid_generate_v4(), 5, 'Ly sữa đá trứ danh tuyệt vời.', '${c1}', '${cafeIds[11]}'),
        
        -- Khách 2
        (uuid_generate_v4(), 5, 'Concept bao cấp hay ho.', '${c2}', '${cafeIds[2]}'),
        (uuid_generate_v4(), 4, 'Ngồi vỉa hè siêu chill.', '${c2}', '${cafeIds[3]}'),
        (uuid_generate_v4(), 5, 'Decor đẹp rụng rời.', '${c2}', '${cafeIds[14]}'),
        
        -- Khách 3
        (uuid_generate_v4(), 5, 'Không gian chuyên nghiệp.', '${c3}', '${cafeIds[4]}'),
        (uuid_generate_v4(), 5, 'Trà đào cam sả chân ái!', '${c3}', '${cafeIds[5]}'),
        (uuid_generate_v4(), 4, 'Specialty chuẩn bài.', '${c3}', '${cafeIds[18]}'),
        
        -- Khách 4
        (uuid_generate_v4(), 3, 'Cafe mộc, chụp ảnh hợp.', '${c4}', '${cafeIds[6]}'),
        (uuid_generate_v4(), 5, 'Yên tĩnh tuyệt đối để đọc sách.', '${c4}', '${cafeIds[7]}'),
        (uuid_generate_v4(), 5, 'Trà sữa ngon xỉu.', '${c4}', '${cafeIds[23]}'),
        
        -- Khách 5
        (uuid_generate_v4(), 4, 'Giấy note thú vị.', '${c5}', '${cafeIds[8]}'),
        (uuid_generate_v4(), 5, 'Pha chế AI xịn.', '${c5}', '${cafeIds[9]}'),
        (uuid_generate_v4(), 5, 'Cộng Hồ Gươm thì đỉnh rồi.', '${c5}', '${cafeIds[26]}'),

        -- Review Vĩnh Yên
        (uuid_generate_v4(), 5, 'Yên tĩnh làm việc tập trung', '${c1}', '${cafeIds[10]}');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "reviews";`);
    await queryRunner.query(`DELETE FROM "operating_hours";`);
    await queryRunner.query(`DELETE FROM "cafes";`);
    await queryRunner.query(`DELETE FROM "users";`);
  }
}
