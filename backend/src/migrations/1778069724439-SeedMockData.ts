import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedMockData1778069724439 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    const hash = await bcrypt.hash('123456', 10);

    // --- 1. ID CỐ ĐỊNH ---
    const adminId = '11111111-1111-1111-1111-111111111111';

    // 10 Chủ quán (o1-o5 cũ + o6 Tester + o7-o11 mới)
    const o1 = '22222222-2222-2222-2222-222222222221';
    const o2 = '22222222-2222-2222-2222-222222222222';
    const o3 = '22222222-2222-2222-2222-222222222223';
    const o4 = '22222222-2222-2222-2222-222222222224';
    const o5 = '22222222-2222-2222-2222-222222222225';
    const o6 = '22222222-2222-2222-2222-222222222226'; // Vĩnh Yên Tester
    const o7 = '22222222-2222-2222-2222-222222222227';
    const o8 = '22222222-2222-2222-2222-222222222228';
    const o9 = '22222222-2222-2222-2222-222222222229';
    const o10 = '22222222-2222-2222-2222-22222222222a';
    const o11 = '22222222-2222-2222-2222-22222222222b';

    // 30 Khách hàng (c1-c5 cũ + c6-c30 mới)
    const customers = [
      '33333333-3333-3333-3333-333333333331', // c1
      '33333333-3333-3333-3333-333333333332', // c2
      '33333333-3333-3333-3333-333333333333', // c3
      '33333333-3333-3333-3333-333333333334', // c4
      '33333333-3333-3333-3333-333333333335', // c5
      '33333333-3333-3333-3333-333333333336',
      '33333333-3333-3333-3333-333333333337',
      '33333333-3333-3333-3333-333333333338',
      '33333333-3333-3333-3333-333333333339',
      '33333333-3333-3333-3333-33333333333a',
      '33333333-3333-3333-3333-33333333333b',
      '33333333-3333-3333-3333-33333333333c',
      '33333333-3333-3333-3333-33333333333d',
      '33333333-3333-3333-3333-33333333333e',
      '33333333-3333-3333-3333-33333333333f',
      '33333333-3333-3333-3333-333333333340',
      '33333333-3333-3333-3333-333333333341',
      '33333333-3333-3333-3333-333333333342',
      '33333333-3333-3333-3333-333333333343',
      '33333333-3333-3333-3333-333333333344',
      '33333333-3333-3333-3333-333333333345',
      '33333333-3333-3333-3333-333333333346',
      '33333333-3333-3333-3333-333333333347',
      '33333333-3333-3333-3333-333333333348',
      '33333333-3333-3333-3333-333333333349',
      '33333333-3333-3333-3333-33333333334a',
      '33333333-3333-3333-3333-33333333334b',
      '33333333-3333-3333-3333-33333333334c',
      '33333333-3333-3333-3333-33333333334d',
      '33333333-3333-3333-3333-33333333334e',
    ];
    const [c1, c2, c3, c4, c5] = customers;

    // 30 Quán Cafe
    const cafeIds = Array.from(
      { length: 30 },
      (_, i) =>
        `44444444-4444-4444-4444-4444444444${(i + 1).toString().padStart(2, '0')}`,
    );

    // =====================================================================
    // HELPER: ngày rải rác từ 2026-01-01 đến 2026-05-25
    // =====================================================================
    // Tạo sẵn 41 mốc ngày (1 admin + 10 owner + 30 customer)
    const dates = [
      // Admin
      '2025-12-01',
      // 10 owners — rải từ tháng 1 → tháng 3
      '2026-01-03',
      '2026-01-12',
      '2026-01-20',
      '2026-01-28',
      '2026-02-05',
      '2026-02-14',
      '2026-02-22',
      '2026-03-02',
      '2026-03-10',
      '2026-03-18',
      '2026-03-25',
      // 30 customers — rải từ tháng 1 → tháng 5
      '2026-01-05',
      '2026-01-08',
      '2026-01-15',
      '2026-01-22',
      '2026-01-29',
      '2026-02-03',
      '2026-02-08',
      '2026-02-13',
      '2026-02-18',
      '2026-02-23',
      '2026-03-01',
      '2026-03-06',
      '2026-03-11',
      '2026-03-16',
      '2026-03-21',
      '2026-03-26',
      '2026-03-31',
      '2026-04-05',
      '2026-04-10',
      '2026-04-15',
      '2026-04-20',
      '2026-04-25',
      '2026-05-01',
      '2026-05-06',
      '2026-05-11',
      '2026-05-16',
      '2026-05-21',
      '2026-05-24',
      '2026-05-26',
      '2026-05-28',
    ];

    const [
      dAdmin,
      dO1,
      dO2,
      dO3,
      dO4,
      dO5,
      dO6,
      dO7,
      dO8,
      dO9,
      dO10,
      dO11,
      dC1,
      dC2,
      dC3,
      dC4,
      dC5,
      dC6,
      dC7,
      dC8,
      dC9,
      dC10,
      dC11,
      dC12,
      dC13,
      dC14,
      dC15,
      dC16,
      dC17,
      dC18,
      dC19,
      dC20,
      dC21,
      dC22,
      dC23,
      dC24,
      dC25,
      dC26,
      dC27,
      dC28,
      dC29,
      dC30,
    ] = dates;

    // =====================================================================
    // 1. THÊM USERS
    // =====================================================================
    await queryRunner.query(`
        INSERT INTO "users" ("id", "fullName", "email", "phone", "password", "avatar", "address", "bio", "role", "createdAt") VALUES
        -- 1 Admin
        ('${adminId}', 'Hệ thống WorkSpot', 'admin@workspot.vn', '0999999999', '${hash}', NULL, 'Trụ sở WorkSpot Hà Nội', 'Quản trị viên hệ thống', 'admin', '${dAdmin}'),
        
        -- 10 Chủ quán
        ('${o1}',  'Nguyễn Văn An',    'an.nguyen@owner.vn',    '0901111111', '${hash}', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',  'Cầu Giấy, Hà Nội',        'Đam mê kinh doanh F&B.',            'owner', '${dO1}'),
        ('${o2}',  'Trần Thị Bích',    'bich.tran@owner.vn',    '0902222222', '${hash}', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',  'Hoàn Kiếm, Hà Nội',       'Quản lý chuỗi quán cafe hoài cổ.', 'owner', '${dO2}'),
        ('${o3}',  'Lê Hoàng Hải',     'hai.le@owner.vn',       '0903333333', '${hash}', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',  'Đống Đa, Hà Nội',         'Chuyên gia pha chế.',               'owner', '${dO3}'),
        ('${o4}',  'Phạm Thị Mai',     'mai.pham@owner.vn',     '0904444444', '${hash}', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',  'Hai Bà Trưng, Hà Nội',    'Cafe kết hợp thư viện sách.',       'owner', '${dO4}'),
        ('${o5}',  'Vũ Đức Thắng',     'thang.vu@owner.vn',     '0905555555', '${hash}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',  'Ba Đình, Hà Nội',         'Freelancer Connector.',             'owner', '${dO5}'),
        ('${o6}',  'Vĩnh Yên Tester',  'vinhyen@owner.vn',      '0906666666', '${hash}', NULL,                                                                   'Vĩnh Yên, Vĩnh Phúc',     'GPS Tester.',                       'owner', '${dO6}'),
        ('${o7}',  'Hoàng Minh Tuấn',  'tuan.hoang@owner.vn',   '0907777777', '${hash}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',  'Đống Đa, Hà Nội',         'Mê phong cách cafe Nhật Bản.',      'owner', '${dO7}'),
        ('${o8}',  'Ngô Thị Phương',   'phuong.ngo@owner.vn',   '0908888888', '${hash}', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',  'Cầu Giấy, Hà Nội',        'Barista chuyên nghiệp 8 năm.',      'owner', '${dO8}'),
        ('${o9}',  'Đặng Quốc Bảo',    'bao.dang@owner.vn',     '0909999999', '${hash}', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',  'Tây Hồ, Hà Nội',          'Khởi nghiệp F&B lần 2.',            'owner', '${dO9}'),
        ('${o10}', 'Lý Thu Hà',        'ha.ly@owner.vn',         '0910101010', '${hash}', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Hoàng Mai, Hà Nội',       'Cafe phong cách Hàn Quốc.',         'owner', '${dO10}'),
        ('${o11}', 'Phan Anh Khoa',    'khoa.phan@owner.vn',     '0911010101', '${hash}', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400', 'Long Biên, Hà Nội',       'Đưa specialty coffee đến mọi người.', 'owner', '${dO11}'),

        -- 30 Khách hàng
        ('${customers[0]}',  'Takashi Sato',      'sato.takashi@gmail.com', '0911111111', '${hash}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Thanh Xuan, Ha Noi',  'IT専攻の学生です。締め切りに追われています。',    'customer', '${dC1}'),
        ('${customers[1]}',  'Yuki Tanaka',       'tanaka.yuki@gmail.com',  '0912222222', '${hash}', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Tay Ho, Ha Noi',     'フリーランスのデザイナーです。おしゃれなカフェが好き。',           'customer', '${dC2}'),
        ('${customers[2]}',  'Hiroshi Watanabe',  'watanabe.h@gmail.com',   '0913333333', '${hash}', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400', 'Nam Tu Liem, Ha Noi','会社員です。週末によくノマドワークをします。',                  'customer', '${dC3}'),
        ('${customers[3]}',  'Sakura Takahashi',  'takahashi.s@gmail.com',  '0914444444', '${hash}', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'Ha Dong, Ha Noi',    'カフェ巡りとレビューが趣味です。',        'customer', '${dC4}'),
        ('${customers[4]}',  'Kenji Ito',         'ito.kenji@gmail.com',    '0915555555', '${hash}', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'Hoang Mai, Ha Noi',  'リモートワーカーです。静かな場所を探しています。',                 'customer', '${dC5}'),
        ('${customers[5]}',  'Rin Yamamoto',      'yamamoto.rin@gmail.com', '0916111111', '${hash}', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Ba Dinh, Ha Noi',    'カフェでコードを書くのが好きなエンジニア。',   'customer', '${dC6}'),
        ('${customers[6]}',  'Kazuki Nakamura',   'nakamura.k@gmail.com',   '0916222222', '${hash}', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'Cau Giay, Ha Noi',   '日本語教育を勉強している留学生です。',        'customer', '${dC7}'),
        ('${customers[7]}',  'Manami Kobayashi',  'kobayashi.m@gmail.com',  '0916333333', '${hash}', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'Dong Da, Ha Noi',    'フリーライター。静かで集中できる空間が好き。',                 'customer', '${dC8}'),
        ('${customers[8]}',  'Souta Kato',        'kato.souta@gmail.com',   '0916444444', '${hash}', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Hai Ba Trung, Ha Noi','グルメブロガーです。美味しいコーヒーを紹介します。',               'customer', '${dC9}'),
        ('${customers[9]}',  'Yui Yoshida',       'yoshida.yui@gmail.com',  '0916555555', '${hash}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Hoan Kiem, Ha Noi',  '起 nghiệp。打ち合わせに使えるカフェを探しています。',               'customer', '${dC10}'),
        ('${customers[10]}', 'Daiki Yamada',      'yamada.daiki@gmail.com', '0917111111', '${hash}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Long Bien, Ha Noi',  'コンテンツクリエイター。動画編集ができる場所。',               'customer', '${dC11}'),
        ('${customers[11]}', 'Haruka Sasaki',     'sasaki.haruka@gmail.com','0917222222', '${hash}', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Tay Ho, Ha Noi',     'プロダクトマネージャー。Wi-Fiと電源が必須。',               'customer', '${dC12}'),
        ('${customers[12]}', 'Kaito Yamaguchi',   'yamaguchi.k@gmail.com',  '0917333333', '${hash}', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400', 'Thanh Xuan, Ha Noi', 'UXデザイナー。インスピレーションを求めて。',                   'customer', '${dC13}'),
        ('${customers[13]}', 'Aoi Matsumoto',     'matsumoto.aoi@gmail.com','0917444444', '${hash}', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'Ha Dong, Ha Noi',    'デジタルマーケター。カフェで仕事するのが一番捗る。',              'customer', '${dC14}'),
        ('${customers[14]}', 'Takumi Inoue',      'inoue.takumi@gmail.com', '0917555555', '${hash}', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'Cau Giay, Ha Noi',   'フリーランス翻訳者。静かな環境を好みます。',              'customer', '${dC15}'),
        ('${customers[15]}', 'Hina Kimura',       'kimura.hina@gmail.com',  '0918111111', '${hash}', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Hoang Mai, Ha Noi',  '会計士。数字の整理に没頭できる場所。',                  'customer', '${dC16}'),
        ('${customers[16]}', 'Riku Hayashi',      'hayashi.riku@gmail.com', '0918222222', '${hash}', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'Nam Tu Liem, Ha Noi', '日本語教師。レッスン準備用。',          'customer', '${dC17}'),
        ('${customers[17]}', 'Miu Shimizu',       'shimizu.miu@gmail.com',  '0918333333', '${hash}', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'Ba Dinh, Ha Noi',    '建築家。素敵なインテリアのカフェが好き。',                  'customer', '${dC18}'),
        ('${customers[18]}', 'Haruto Yamazaki',   'yamamazaki.h@gmail.com', '0918444444', '${hash}', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Dong Da, Ha Noi',    '銀行員。休日の勉強スポット。',           'customer', '${dC19}'),
        ('${customers[19]}', 'Mei Mori',          'mori.mei@gmail.com',     '0918555555', '${hash}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Hoan Kiem, Ha Noi',  'フリーのフォトグラファー。写真映えするカフェ。',       'customer', '${dC20}'),
        ('${customers[20]}', 'Ryota Abe',         'abe.ryota@gmail.com',    '0919111111', '${hash}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Tay Ho, Ha Noi',     '弁護士。資料を読むための静かなカフェ。',                       'customer', '${dC21}'),
        ('${customers[21]}', 'Miyuu Ikeda',       'ikeda.miyuu@gmail.com',  '0919222222', '${hash}', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Hai Ba Trung, Ha Noi','研修医。たまの休息に美味しいラテを。',               'customer', '${dC22}'),
        ('${customers[22]}', 'Sora Hashimoto',    'hashimoto.s@gmail.com',  '0919333333', '${hash}', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400', 'Cau Giay, Ha Noi',   '薬剤師。リラックスできる空間。',                       'customer', '${dC23}'),
        ('${customers[23]}', 'Misaki Yamashita',  'yamashita.m@gmail.com',  '0919444444', '${hash}', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'Long Bien, Ha Noi',  'ゲーム開発者。深夜まで開いているカフェ。',                'customer', '${dC24}'),
        ('${customers[24]}', 'Taiga Ishikawa',    'ishikawa.t@gmail.com',   '0919555555', '${hash}', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'Thanh Xuan, Ha Noi', 'データアナリスト。集中して仕事ができる場所。',                  'customer', '${dC25}'),
        ('${customers[25]}', 'Nanami Maeda',      'maeda.nanami@gmail.com', '0920111111', '${hash}', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Ha Dong, Ha Noi',    'コピーライター。アイデアを出すために。',                    'customer', '${dC26}'),
        ('${customers[26]}', 'Keisuke Aoki',      'aoki.keisuke@gmail.com', '0920222222', '${hash}', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'Ba Dinh, Ha Noi',     '電気エンジニア。気分転換にカフェへ。',                    'customer', '${dC27}'),
        ('${customers[27]}', 'Kokona Hasegawa',   'hasegawa.k@gmail.com',   '0920333333', '${hash}', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'Nam Tu Liem, Ha Noi','財務コンサルタント。落ち着いた雰囲気が好み。',             'customer', '${dC28}'),
        ('${customers[28]}', 'Tsubasa Saito',     'saito.tsubasa@gmail.com', '0920444444', '${hash}', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Hoang Mai, Ha Noi',  'QAエンジニア。バグ探しもカフェなら楽しい。',                   'customer', '${dC29}'),
        ('${customers[29]}', 'Yuka Okada',        'okada.yuka@gmail.com',   '0920555555', '${hash}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Dong Da, Ha Noi',    '人事マネージャー。リクルート面接の準備。',                    'customer', '${dC30}');
    `);

    // =====================================================================
    // GALLERY CONSTANTS
    // =====================================================================
    const G_Modern_1 =
      '{"https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-149547447287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Modern_2 =
      '{"https://images.unsplash.com/photo-1612192527395-06b72da6b35a?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1648462908676-8305f0eff8e0?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop"}';
    const G_Modern_3 =
      '{"https://images.unsplash.com/photo-1648462908676-8305f0eff8e0?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop"}';
    const G_Garden_1 =
      '{"https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-149547447287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop"}';
    const G_Garden_2 =
      '{"https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-149547447287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop"}';
    const G_Vintage_1 =
      '{"https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1463797221720-6b07e6426c24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop"}';
    const G_Vintage_2 =
      '{"https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1463797221720-6b07e6426c24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-149547447287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Cozy_1 =
      '{"https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop"}';
    const G_Cozy_2 =
      '{"https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80&auto=format&fit=crop"}';
    const G_Cozy_3 =
      '{"https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Luxury_1 =
      '{"https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop"}';
    const G_Luxury_2 =
      '{"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Work_1 =
      '{"https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop"}';
    const G_Work_2 =
      '{"https://images.unsplash.com/photo-1588253137728-1e4dd0fe9a93?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&auto=format&fit=crop"}';

    // =====================================================================
    // 2. THÊM CAFES — avatar = ảnh đầu tiên của images array
    //    createdAt rải rác từ tháng 1-2026 đến tháng 5-2026
    // =====================================================================
    await queryRunner.query(`
            INSERT INTO "cafes" ("id", "name", "description", "address", "latitude", "longitude", "avatar", "images", "facilities", "status", "rejectionReason", "realtimeStatus", "owner_id", "createdAt") VALUES

            -- ===================== OWNER 1 (o1) — tháng 1 =====================
            ('${cafeIds[0]}', 'The Coffee House - Cau Giay',
            'モダンな空間で、グループワークに最適です。',
            'So 2 Khuc Thua Du, Cau Giay, Ha Noi', 21.033333, 105.790580,
            'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_1}', '{wifi,socket,workspace,desk}', 'approved', NULL, 'busy', '${o1}', '2026-01-05'),

            ('${cafeIds[1]}', 'Highlands Coffee - Cot Co',
            '歴史的な景色が美しく、濃厚なドリンクが楽しめます。',
            '28A Dien Bien Phu, Ba Dinh, Ha Noi', 21.032220, 105.838880,
            'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_1}', '{wifi,cleanliness,snack}', 'pending', NULL, 'normal', '${o1}', '2026-01-08'),

            ('${cafeIds[11]}', 'Katinat Saigon Kafe - Ly Thuong Kiet',
            '大人気ブランドがハノイに初登場しました。',
            '60 Ly Thuong Kiet, Hoan Kiem, Ha Noi', 21.023810, 105.845620,
            'https://images.unsplash.com/photo-1612192527395-06b72da6b35a?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_2}', '{wifi,cleanliness}', 'approved', NULL, 'busy', '${o1}', '2026-01-15'),

            ('${cafeIds[12]}', 'Go Cafe - Nguyen Trai',
            '挽きたてコーヒーと、非常に座り心地の良い席が自慢。',
            '123 Nguyen Trai, Thanh Xuan, Ha Noi', 20.998980, 105.811560,
            'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_1}', '{wifi,socket}', 'approved', NULL, 'normal', '${o1}', '2026-02-01'),

            ('${cafeIds[13]}', 'Maison Marou - Tho Nhuom',
            'チョコレートとスイーツのパラダイス。',
            '91A Tho Nhuom, Hoan Kiem, Ha Noi', 21.026410, 105.845650,
            'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_1}', '{wifi,snack,cleanliness}', 'rejected', 'Vui lòng cung cấp thêm hình ảnh mặt tiền.', 'normal', '${o1}', '2026-02-10'),

            -- ===================== OWNER 2 (o2) — tháng 1-2 =====================
            ('${cafeIds[2]}', 'Cong Ca Phe - Trang Tien',
            'レトロで独特なハノイの古き良きスタイル。',
            '46 Trang Tien, Hoan Kiem, Ha Noi', 21.025550, 105.852220,
            'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_1}', '{wifi,cleanliness,smoking_rule}', 'rejected', 'Hình ảnh mờ, địa chỉ không khớp giấy phép.', 'normal', '${o2}', '2026-01-10'),

            ('${cafeIds[3]}', 'Aha Cafe - Ton Duc Thang',
            '広々とした涼しいテラス席のあるカフェ。',
            '212 Ton Duc Thang, Dong Da, Ha Noi', 21.023330, 105.831110,
            'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_2}', '{wifi,smoking_rule}', 'approved', NULL, 'available', '${o2}', '2026-01-18'),

            ('${cafeIds[14]}', 'RuNam Bistro - Nha Tho',
            '高級感あふれるインドシナスタイル。',
            '13 Nha Tho, Hoan Kiem, Ha Noi', 21.028630, 105.849210,
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_2}', '{wifi,snack,cleanliness}', 'pending', NULL, 'normal', '${o2}', '2026-01-25'),

            ('${cafeIds[15]}', 'Trung Nguyen Legend - Hai Ba Trung',
            'エネルギーに満ちた特徴的な味わいのコーヒー。',
            '52 Hai Ba Trung, Hoan Kiem, Ha Noi', 21.024560, 105.849760,
            'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_2}', '{wifi,socket,workspace}', 'approved', NULL, 'busy', '${o2}', '2026-02-05'),

            ('${cafeIds[16]}', 'Dinh Cafe - Dinh Tien Hoang',
            '旧市街の伝説的なエッグコーヒー。',
            '13 Dinh Tien Hoang, Hoan Kiem, Ha Noi', 21.031310, 105.853060,
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_2}', '{wifi}', 'approved', NULL, 'busy', '${o2}', '2026-02-20'),

            -- ===================== OWNER 3 (o3) — tháng 2-3 =====================
            ('${cafeIds[4]}', 'All Day Coffee - Quang Trung',
            '自家焙煎コーヒーとヨーロッパ風のおしゃれな空間。',
            '37 Quang Trung, Hoan Kiem, Ha Noi', 21.024440, 105.848880,
            'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_3}', '{wifi,socket,workspace,cleanliness}', 'approved', NULL, 'normal', '${o3}', '2026-02-03'),

            ('${cafeIds[5]}', 'Phuc Long - Vincom Ba Trieu',
            'お茶の味がしっかりしており、ショッピングモール内にあります。',
            '191 Ba Trieu, Hai Ba Trung, Ha Noi', 21.011110, 105.848880,
            'https://images.unsplash.com/photo-1648462908676-8305f0eff8e0?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_3}', '{wifi,snack}', 'pending', NULL, 'normal', '${o3}', '2026-02-12'),

            ('${cafeIds[17]}', 'The Running Bean - Hang Bac',
            '旧市街を見渡せる非常に贅沢な空間。',
            '22 Hang Bac, Hoan Kiem, Ha Noi', 21.033560, 105.852440,
            'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_1}', '{wifi,socket,cleanliness}', 'approved', NULL, 'available', '${o3}', '2026-02-20'),

            ('${cafeIds[18]}', 'Blackbird Coffee - Chan Cam',
            'コーヒー愛好家のためのスペシャルティコーヒー。',
            '5 Chan Cam, Hoan Kiem, Ha Noi', 21.029850, 105.847120,
            'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=600&q=80&auto=format&fit=crop',
            '${G_Cozy_2}', '{wifi,workspace}', 'approved', NULL, 'busy', '${o3}', '2026-03-01'),

            ('${cafeIds[19]}', 'Serein Cafe & Lounge - Tran Nhat Duat',
            'ロンビエン橋を一望できる、映えスポット。',
            '16 Tran Nhat Duat, Ha Noi', 21.038890, 105.852580,
            'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_1}', '{wifi,smoking_rule}', 'hidden', 'Quán đang bảo trì nâng cấp thang máy.', 'normal', '${o3}', '2026-03-10'),

            -- ===================== OWNER 4 (o4) — tháng 2-4 =====================
            ('${cafeIds[6]}', 'Kafa Cafe - Tho Nhuom',
            'ハノイらしいストリートカフェの雰囲気。',
            '212 Tho Nhuom, Hoan Kiem, Ha Noi', 21.027770, 105.845550,
            'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_1}', '{wifi,smoking_rule}', 'approved', NULL, 'busy', '${o4}', '2026-02-08'),

            ('${cafeIds[7]}', 'Tranquil Books & Coffee',
            '非常に静かで、読書に最適です。',
            '5 Nguyen Quang Bich, Hoan Kiem, Ha Noi', 21.028880, 105.843330,
            'https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=600&q=80&auto=format&fit=crop',
            '${G_Work_1}', '{wifi,socket,workspace,desk,cleanliness}', 'approved', NULL, 'available', '${o4}', '2026-02-22'),

            ('${cafeIds[20]}', 'Lofita - Pho Hue',
            'ロマンチックなスタイルのアフタヌーンティー。',
            'Tang 9, 338 Pho Hue, Ha Noi', 21.011880, 105.851210,
            'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_1}', '{wifi,cleanliness,snack}', 'approved', NULL, 'normal', '${o4}', '2026-03-05'),

            ('${cafeIds[21]}', 'Laika Cafe - Nga Tu So',
            '開放的な交差点の景色が見えます。',
            '1 Nga Tu So, Dong Da, Ha Noi', 21.002880, 105.818310,
            'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_1}', '{wifi,socket}', 'pending', NULL, 'normal', '${o4}', '2026-03-20'),

            ('${cafeIds[22]}', 'Cheese Coffee - Le Dai Hanh',
            '有名なクリームチーズコーヒー。',
            '50 Le Dai Hanh, Ha Noi', 21.011220, 105.849110,
            'https://images.unsplash.com/photo-1612192527395-06b72da6b35a?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_2}', '{wifi,socket,cleanliness}', 'approved', NULL, 'busy', '${o4}', '2026-04-02'),

            ('${cafeIds[23]}', 'Phe La - Pham Ngoc Thach',
            'ラムドン産の上質なウーロン茶。',
            '2 Ton That Tung, Ha Noi', 21.005780, 105.831510,
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_2}', '{wifi,snack}', 'approved', NULL, 'busy', '${o4}', '2026-04-15'),

            -- ===================== OWNER 5 (o5) — tháng 3-5 =====================
            ('${cafeIds[8]}', 'The Note Coffee',
            '可愛い付箋でいっぱいのカフェ。',
            '64 Luong Van Can, Ha Noi', 21.031110, 105.851110,
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_2}', '{wifi,cleanliness}', 'approved', NULL, 'normal', '${o5}', '2026-03-08'),

            ('${cafeIds[9]}', 'NeoCafe - Le Dai Hanh',
            'AI技術を使った抽出と、開放的な空間。',
            '33 Le Dai Hanh, Ha Noi', 21.008880, 105.847770,
            'https://images.unsplash.com/photo-1648462908676-8305f0eff8e0?w=600&q=80&auto=format&fit=crop',
            '${G_Modern_3}', '{wifi,socket,workspace,desk}', 'approved', NULL, 'busy', '${o5}', '2026-03-18'),

            ('${cafeIds[24]}', 'Twitter Beans Coffee - Duy Tan',
            'オフィスワーカーに最適な場所。',
            'Toa nha CMC, Cau Giay, Ha Noi', 21.030510, 105.782810,
            'https://images.unsplash.com/photo-1588253137728-1e4dd0fe9a93?w=600&q=80&auto=format&fit=crop',
            '${G_Work_2}', '{wifi,socket,workspace}', 'approved', NULL, 'available', '${o5}', '2026-03-28'),

            ('${cafeIds[25]}', 'Highlands Coffee - Hoang Dao Thuy',
            'にぎやかな中心部にあり、ガラス張りの窓からの景色が良い。',
            'N04 Hoang Dao Thuy, Ha Noi', 21.008210, 105.801610,
            'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_2}', '{wifi,cleanliness,snack}', 'approved', NULL, 'normal', '${o5}', '2026-04-08'),

            ('${cafeIds[26]}', 'Cong Ca Phe - Ho Guom',
            'ロマンチックな亀の塔を完璧に見渡せます。',
            '116 Cau Go, Ha Noi', 21.031610, 105.852110,
            'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_1}', '{wifi,smoking_rule}', 'approved', NULL, 'busy', '${o5}', '2026-04-20'),

            ('${cafeIds[27]}', 'Aha Cafe - Nguyen Van Cu',
            '風通しの良い、広いテラス席。',
            '154 Nguyen Van Cu, Long Bien, Ha Noi', 21.045110, 105.871110,
            'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&q=80&auto=format&fit=crop',
            '${G_Garden_1}', '{wifi}', 'rejected', 'Ảnh chụp không rõ khu vực làm việc.', 'normal', '${o5}', '2026-04-28'),

            ('${cafeIds[28]}', 'Kafa - Tran Phu',
            '古風で心地よい涼しい空間。',
            '15 Tran Phu, Ba Dinh, Ha Noi', 21.031210, 105.839110,
            'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80&auto=format&fit=crop',
            '${G_Vintage_2}', '{wifi,smoking_rule}', 'approved', NULL, 'available', '${o5}', '2026-05-05'),

            -- ===================== OWNER 6 (o6 - Vĩnh Yên) =====================
            ('${cafeIds[10]}', 'WorkSpot Vinh Yen',
            '市内中心部にある静かなカフェ。',
            'Vinh Yen, Vinh Phuc', 21.315540, 105.626900,
            'https://images.unsplash.com/photo-1600353565737-2427a1ba3d3a?w=600&q=80&auto=format&fit=crop',
            '${G_Work_1}', '{wifi,socket,workspace,desk,cleanliness}', 'approved', NULL, 'available', '${o6}', '2026-01-20'),

            ('${cafeIds[29]}', 'WorkSpot Tam Dao',
            '山の風と雲を感じられる涼しい場所。',
            'Thi tran Tam Dao, Vinh Phuc', 21.458900, 105.648100,
            'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80&auto=format&fit=crop',
            '${G_Luxury_1}', '{wifi}', 'pending', NULL, 'normal', '${o6}', '2026-05-10')
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
    // 4. THÊM BÀI ĐÁNH GIÁ
    // =====================================================================
    await queryRunner.query(`
        INSERT INTO "reviews" ("id", "rating", "comment", "user_id", "cafe_id") VALUES
        -- Khách 1
        (uuid_generate_v4(), 5, 'テーブルが広くて、一日中コーディングに集中できます！',           '${c1}', '${cafeIds[0]}'),
        (uuid_generate_v4(), 4, 'フラッグタワーの景色がとてもリラックスできます。',     '${c1}', '${cafeIds[1]}'),
        (uuid_generate_v4(), 5, '名物のベトナムミルクコーヒーは素晴らしい美味しさです。',      '${c1}', '${cafeIds[11]}'),
        (uuid_generate_v4(), 5, '静かで仕事に非常に集中しやすいです。',       '${c1}', '${cafeIds[10]}'),
        
        -- Khách 2
        (uuid_generate_v4(), 5, 'レトロな雰囲気がとても面白いコンセプトです。',            '${c2}', '${cafeIds[2]}'),
        (uuid_generate_v4(), 4, 'テラス席（路上）で過ごす時間は最高に心地よいです。',            '${c2}', '${cafeIds[3]}'),
        (uuid_generate_v4(), 5, 'インテリアがとても美しく、写真映えします。',                '${c2}', '${cafeIds[14]}'),
        
        -- Khách 3
        (uuid_generate_v4(), 5, 'とてもプロフェッショナルで洗練された空間です。',          '${c3}', '${cafeIds[4]}'),
        (uuid_generate_v4(), 5, 'ピーチオレンジレモングラスティーが本当に大好きです！',            '${c3}', '${cafeIds[5]}'),
        (uuid_generate_v4(), 4, '本物のスペシャルティコーヒーが味わえます。',               '${c3}', '${cafeIds[18]}'),
        
        -- Khách 4
        (uuid_generate_v4(), 3, 'シンプルで温かみがあり、撮影にぴったりです。',           '${c4}', '${cafeIds[6]}'),
        (uuid_generate_v4(), 5, '読書に最適な、完璧な静けさがあります。',   '${c4}', '${cafeIds[7]}'),
        (uuid_generate_v4(), 5, 'ミルクティーが感動的な美味しさです。',                  '${c4}', '${cafeIds[23]}'),
        
        -- Khách 5
        (uuid_generate_v4(), 4, '店内のカラフルな付箋メモが面白いです。',                  '${c5}', '${cafeIds[8]}'),
        (uuid_generate_v4(), 5, 'AIロボットによる抽出技術がすごいです。',                    '${c5}', '${cafeIds[9]}'),
        (uuid_generate_v4(), 5, 'ホアンキエム湖のコングカフェはやはり最高です。',        '${c5}', '${cafeIds[26]}');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "reviews";`);
    await queryRunner.query(`DELETE FROM "operating_hours";`);
    await queryRunner.query(`DELETE FROM "cafes";`);
    await queryRunner.query(`DELETE FROM "users";`);
  }
}
