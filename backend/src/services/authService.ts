import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Database } from '../config/database.js';
import { CompanyAccount, LoginRequest, LoginResponse } from '../types/index.js';
import { config } from '../config/env.js';
import { createError } from '../middleware/errorHandler.js';

export class AuthService {
  constructor(private db: Database) {}

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const { id, pass } = loginData;

      if (!id || !pass) {
        return {
          success: false,
          message: 'IDとパスワードは必須です'
        };
      }

      const account = await this.db.get<CompanyAccount>(
        'SELECT * FROM company_accounts WHERE login_id = ?',
        [id]
      );

      if (!account) {
        return {
          success: false,
          message: 'IDまたはパスワードが正しくありません'
        };
      }

      const isPasswordValid = await bcrypt.compare(pass, account.password_hash);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'IDまたはパスワードが正しくありません'
        };
      }

      const token = jwt.sign(
        {
          companyId: account.company_id,
          companyName: account.company_name
        },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'ログイン処理中にエラーが発生しました'
      };
    }
  }

  async createCompanyAccount(
    companyId: string,
    companyName: string,
    loginId: string,
    password: string
  ): Promise<CompanyAccount> {
    try {
      const existingAccount = await this.db.get<CompanyAccount>(
        'SELECT * FROM company_accounts WHERE company_id = ? OR login_id = ?',
        [companyId, loginId]
      );

      if (existingAccount) {
        throw createError('会社IDまたはログインIDが既に存在します', 409);
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const result = await this.db.run(
        `INSERT INTO company_accounts (company_id, company_name, login_id, password_hash)
         VALUES (?, ?, ?, ?)`,
        [companyId, companyName, loginId, passwordHash]
      );

      const newAccount = await this.db.get<CompanyAccount>(
        'SELECT * FROM company_accounts WHERE id = ?',
        [result.lastID]
      );

      if (!newAccount) {
        throw createError('アカウントの作成に失敗しました', 500);
      }

      return newAccount;
    } catch (error) {
      console.error('Create company account error:', error);
      throw error;
    }
  }

  async getCompanyAccount(companyId: string): Promise<CompanyAccount | null> {
    try {
      const account = await this.db.get<CompanyAccount>(
        'SELECT * FROM company_accounts WHERE company_id = ?',
        [companyId]
      );
      return account || null;
    } catch (error) {
      console.error('Get company account error:', error);
      throw createError('アカウント情報の取得に失敗しました', 500);
    }
  }
}