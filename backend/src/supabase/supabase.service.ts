import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');

    if (!url || !key) {
      throw new Error('SUPABASE_URL và SUPABASE_KEY phải được cấu hình trong .env');
    }

    this.client = createClient(url, key);
  }

  /**
   * Upload một file lên Supabase Storage và trả về public URL.
   * @param bucket   Tên bucket ('cafe-images' | 'review-images' | 'avatars')
   * @param filePath Đường dẫn lưu trong bucket (ví dụ: '1717123456-abc.jpg')
   * @param buffer   Buffer nội dung file
   * @param mimeType MIME type (ví dụ: 'image/jpeg')
   */
  async uploadFile(
    bucket: string,
    filePath: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const { error } = await this.client.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true, // ghi đè nếu cùng tên (an toàn hơn khi retry)
      });

    if (error) {
      throw new InternalServerErrorException(
        `Không thể upload ảnh lên Supabase [${bucket}/${filePath}]: ${error.message}`,
      );
    }

    // Lấy public URL (bucket phải được đặt là Public)
    const { data } = this.client.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * Xoá một file khỏi Supabase Storage (dùng khi cần dọn ảnh cũ).
   * @param bucket   Tên bucket
   * @param filePath Đường dẫn file trong bucket
   */
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove([filePath]);
    if (error) {
      // Chỉ log, không throw — xoá thất bại không nên chặn luồng chính
      console.warn(`[SupabaseService] Không thể xoá file [${bucket}/${filePath}]: ${error.message}`);
    }
  }

  /**
   * Trích xuất filePath từ Supabase public URL để dùng với deleteFile().
   * VD: "https://xxx.supabase.co/storage/v1/object/public/cafe-images/abc.jpg" → "abc.jpg"
   */
  extractFilePath(bucket: string, publicUrl: string): string | null {
    try {
      const marker = `/object/public/${bucket}/`;
      const idx = publicUrl.indexOf(marker);
      if (idx === -1) return null;
      return publicUrl.slice(idx + marker.length);
    } catch {
      return null;
    }
  }
}
