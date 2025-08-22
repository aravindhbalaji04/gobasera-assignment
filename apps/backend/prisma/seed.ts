import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Support (super admin) user first
  const supportUser = await prisma.user.upsert({
    where: { firebaseUid: 'support_firebase_uid_123' },
    update: {},
    create: {
      firebaseUid: 'support_firebase_uid_123',
      phone: '+1234567890',
      role: UserRole.SUPPORT,
      isActive: true,
    },
  });

  console.log('✅ Support user created:', supportUser.phone);

  // Create sample society
  const society = await prisma.society.upsert({
    where: { name: 'Sample Society' },
    update: {},
    create: {
      name: 'Sample Society',
      address: '123 Sample Street',
      city: 'Sample City',
      state: 'Sample State',
      pincode: '12345',
      isActive: true,
      createdByUserId: supportUser.id,
    },
  });

  console.log('✅ Society created:', society.name);

  // Create a Committee user
  const committeeUser = await prisma.user.upsert({
    where: { firebaseUid: 'committee_firebase_uid_456' },
    update: {},
    create: {
      firebaseUid: 'committee_firebase_uid_456',
      phone: '+1234567891',
      role: UserRole.COMMITTEE,
      isActive: true,
    },
  });

  console.log('✅ Committee user created:', committeeUser.phone);

  // Create a regular Owner user
  const ownerUser = await prisma.user.upsert({
    where: { firebaseUid: 'owner_firebase_uid_789' },
    update: {},
    create: {
      firebaseUid: 'owner_firebase_uid_789',
      phone: '+1234567892',
      role: UserRole.OWNER,
      isActive: true,
    },
  });

  console.log('✅ Owner user created:', ownerUser.phone);

  // Create a sample registration
  const registration = await prisma.registration.create({
    data: {
      userId: ownerUser.id,
      societyId: society.id,
      status: 'PENDING',
      funnelStage: 'INITIATED',
    },
  });

  console.log('✅ Sample registration created:', registration.id);

  // Create a sample audit log
  const auditLog = await prisma.auditLog.create({
    data: {
      actorUserId: supportUser.id,
      entityType: 'USER',
      entityId: supportUser.id,
      action: 'USER_CREATED',
      dataJson: { userId: supportUser.id, role: supportUser.role },
    },
  });

  console.log('✅ Sample audit log created:', auditLog.id);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Default users created:');
  console.log('Support User: +1234567890 (Super Admin)');
  console.log('Committee User: +1234567891 (Admin)');
  console.log('Owner User: +1234567892 (Regular User)');
  console.log('\n💡 Note: These are placeholder Firebase UIDs. In production, use real Firebase UIDs.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
