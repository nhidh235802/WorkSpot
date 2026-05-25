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
      subject: '【WorkSpot】パスワード再設定のご案内',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e3e3de;border-radius:12px">
          <h2 style="color:#14422d;margin-bottom:8px">パスワード再設定</h2>
          <p style="color:#414943;line-height:1.6">
            WorkSpot アカウントのパスワード再設定のリクエストを受け付けました。<br/>
            以下のボタンをクリックして新しいパスワードを設定してください。<br/>
            リンクの有効期限は <strong>15分</strong> です。
          </p>
          <a href="${resetLink}"
             style="display:inline-block;margin:24px 0;padding:12px 28px;background:#14422d;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            パスワードを再設定する
          </a>
          <p style="color:#999;font-size:13px">
            このメールに心当たりがない場合は、無視していただいて構いません。
          </p>
        </div>
      `,
    });
  }

  async sendCafeHiddenNotification(toEmail: string, cafeName: string, reason: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"WorkSpot" <${this.config.get<string>('MAIL_USER')}>`,
      to: toEmail,
      subject: `【WorkSpot】店舗非表示のご案内: ${cafeName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e3e3de;border-radius:12px">
          <h2 style="color:#ba1a1a;margin-bottom:8px">店舗非表示のお知らせ</h2>
          <p style="color:#414943;line-height:1.6">
            いつもWorkSpotをご利用いただきありがとうございます。<br/>
            管理者により、登録されている店舗「<strong>${cafeName}</strong>」が非表示に設定されました。
          </p>
          <div style="background:#f4f4ef;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #ba1a1a">
            <strong style="color:#1a1c19">非表示の理由:</strong>
            <p style="color:#414943;margin:8px 0 0 0;white-space:pre-wrap">${reason}</p>
          </div>
          <p style="color:#414943;line-height:1.6">
            ご不明な点がある場合や、修正が完了し再申請をご希望の場合は、管理者までお問い合わせください。
          </p>
        </div>
      `,
    });
  }
}
