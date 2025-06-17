import { initializeDatabase, createTables } from '../config/database.js';
import { AuthService } from '../services/authService.js';

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database seeding...');

    const db = await initializeDatabase();
    await createTables(db);

    const authService = new AuthService(db);

    // Check if default company already exists
    const existingCompany = await authService.getCompanyAccount('demo-company');
    
    if (existingCompany) {
      console.log('Default company account already exists:', {
        companyId: existingCompany.company_id,
        companyName: existingCompany.company_name,
        loginId: existingCompany.login_id
      });
    } else {
      const defaultCompany = await authService.createCompanyAccount(
        'demo-company',
        'デモ会社',
        'admin',
        'password'
      );

      console.log('Default company account created:', {
        companyId: defaultCompany.company_id,
        companyName: defaultCompany.company_name,
        loginId: defaultCompany.login_id
      });
    }

    await db.close();
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();