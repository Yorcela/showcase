// import * as argon2 from 'argon2'

// const prisma = new PrismaClient()

// async function createTestUser() {
//     const email = 'test@tallae.fr'
//     const password = '$$pwd202508'
//     const firstName = 'Alec'
//     const lastName = 'Roy'

//     try {
//         console.log('🌱 Checking test user...')

//         // Vérifie si l'utilisateur existe déjà
//         const existingUser = await prisma.user.findUnique({
//             where: { email: email.toLowerCase() },
//         })

//         if (existingUser) {
//             console.log('✅ Test user already exists:', email)
//             return
//         }

//         // Hash du mot de passe (Argon2id)
//         const passwordHash = await argon2.hash(password, {
//             type: argon2.argon2id,
//             memoryCost: 2 ** 16, // 64 MB
//             timeCost: 3,
//             parallelism: 1,
//         })

//         // Création de l'utilisateur
//         const user = await prisma.user.create({
//             data: {
//                 email: email.toLowerCase(),
//                 firstName,
//                 lastName,
//                 passwordHash,
//                 role: UserRole.USER,
//                 status: UserStatus.ACTIVE,
//                 emailVerifiedAt: new Date(),
//             },
//         })

//         console.log('✅ Test user created successfully:')
//         console.log(`   Email: ${user.email}`)
//         console.log(`   Password: ${password}`)
//         console.log(`   Role: ${user.role}`)
//         console.log(`   Status: ${user.status}`)
//         console.log(`   ID: ${user.id}`)
//     } catch (error) {
//         console.error('❌ Error creating test user:', error)
//     }
// }

// async function main() {
//     console.log('🚀 Seeding database...')
//     await createTestUser()
// }

// main()
//     .then(async () => {
//         await prisma.$disconnect()
//         console.log('🌱 Seed completed.')
//     })
//     .catch(async (e) => {
//         console.error('❌ Seed failed:', e)
//         await prisma.$disconnect()
//         process.exit(1)
//     })