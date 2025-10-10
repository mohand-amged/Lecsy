const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to MongoDB successfully');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true
      }
    });
    
    console.log('👥 Recent users:');
    recentUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Created: ${user.createdAt.toISOString()}`);
    });
    
    // Count sessions
    const sessionCount = await prisma.session.count();
    console.log(`🔐 Total sessions: ${sessionCount}`);
    
    // Count accounts
    const accountCount = await prisma.account.count();
    console.log(`🔑 Total accounts: ${accountCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
