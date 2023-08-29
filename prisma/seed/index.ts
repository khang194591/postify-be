import { faker } from '@faker-js/faker/locale/vi';
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';
import * as dayjs from 'dayjs';

const prisma = new PrismaClient();

const seed = async () => {
  // Khởi tạo các user cơ bản với các role khác nhau
  await prisma.user.create({
    data: {
      email: 'admin@ams.vn',
      password: hashSync('123456', 10),
      profile: {
        create: {
          fName: 'Admin',
          lName: 'Ams',
          role: 'ADMINISTRATOR',
        },
      },
    },
  });
  await prisma.user.create({
    data: {
      email: 'khang.td@ams.vn',
      password: hashSync('123456', 10),
      profile: {
        create: {
          fName: 'Khang',
          lName: 'Trịnh Đức',
          role: 'USER',
        },
      },
    },
  });
  // Seeding user với bài viết ngẫu nhiên
  const usersData: any[] = [];
  for (let i = 0; i < 100; i++) {
    const fName = faker.person.firstName();
    const lName = faker.person.lastName();
    const email = faker.internet.email({
      firstName: fName,
      lastName: lName,
      provider: 'ams.vn',
    });
    usersData.push({
      email,
      password: hashSync('123456', 10),
      fName,
      lName,
    });
  }
  await prisma.user.createMany({
    data: usersData.map((user) => ({
      email: user.email,
      password: user.password,
    })),
  });
  const users = await prisma.user.findMany({
    skip: 2,
  });
  users.map(async (user, index) => {
    if (usersData[index]) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          fName: usersData[index].fName,
          lName: usersData[index].lName,
        },
      });
    }
  });
  const profiles = await prisma.profile.findMany();
  profiles.map(async (user) => {
    const posts = [];
    const random = Math.round(Math.random() * 20);
    for (let i = 0; i < random; i++) {
      posts.push({
        title: faker.music.songName(),
        content: faker.word.words({ count: { min: 5, max: 200 } }),
        authorId: user.userId,
        published: true,
        createdAt: dayjs()
          .subtract(Math.random() * 1000, 'hour')
          .toDate(),
      });
    }
    await prisma.post.createMany({
      data: posts,
    });
  });
};

void seed();
