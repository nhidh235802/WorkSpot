import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('MAIL_HOST'),
      port: config.get<number>('MAIL_PORT') ?? 587,
      secure: false,
      auth: {
        user: config.get<string>('MAIL_USER'),
        pass: config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordReset(toEmail: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"WorkSpot" <${this.config.get<string>('MAIL_USER')}>`,
      to: toEmail,
      subject: 'Đặt lại mật khẩu WorkSpot',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e3e3de;border-radius:12px">
          <h2 style="color:#14422d;margin-bottom:8px">Đặt lại mật khẩu</h2>
          <p style="color:#414943;line-height:1.6">
            Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản WorkSpot.<br/>
            Nhấn vào nút bên dưới để tạo mật khẩu mới. Link có hiệu lực trong <strong>15 phút</strong>.
          </p>
          <a href="${resetLink}"
             style="display:inline-block;margin:24px 0;padding:12px 28px;background:#14422d;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            Đặt lại mật khẩu
          </a>
          <p style="color:#999;font-size:13px">
            Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.
          </p>
        </div>
      `,
    });
  }
}
