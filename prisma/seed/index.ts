import { faker } from '@faker-js/faker/locale/vi';
import { PrismaClient, ReactionType } from '@prisma/client';
import { hashSync } from 'bcrypt';
import dayjs from 'dayjs';
import { random } from 'lodash';

const prisma = new PrismaClient();

const seed = async () => {
  // Khởi tạo các user cơ bản với các role khác nhau
  await prisma.account.create({
    data: {
      email: 'admin@ams.vn',
      password: hashSync('123456', 10),
      user: {
        create: {
          fName: 'Admin',
          lName: 'Ams',
          role: 'ADMINISTRATOR',
        },
      },
    },
  });
  const basicUser = await prisma.account.create({
    data: {
      email: 'khang.td@ams.vn',
      password: hashSync('123456', 10),
      user: {
        create: {
          fName: 'Khang',
          lName: 'Trịnh Đức',
          role: 'USER',
        },
      },
    },
  });
  // Seeding user với bài viết ngẫu nhiên
  const accountsData: any[] = [];
  for (let i = 0; i < 100; i++) {
    const fName = faker.person.firstName();
    const lName = faker.person.lastName();
    const email = faker.internet.email({
      firstName: fName,
      lastName: lName,
      provider: 'ams.vn',
    });
    accountsData.push({
      email,
      password: hashSync('123456', 10),
      fName,
      lName,
    });
  }
  await prisma.account.createMany({
    data: accountsData.map((user) => ({
      email: user.email,
      password: user.password,
    })),
  });
  const accounts = await prisma.account.findMany({
    skip: 2,
  });
  accounts.map(async (user, index) => {
    if (accountsData[index]) {
      await prisma.user.create({
        data: {
          accountId: user.id,
          fName: accountsData[index].fName,
          lName: accountsData[index].lName,
        },
      });
    }
  });
  const users = await prisma.user.findMany();
  users.map(async (user) => {
    const posts = [];
    const random = Math.round(Math.random() * 20);
    for (let i = 0; i < random; i++) {
      posts.push({
        title: faker.music.songName(),
        body: faker.word.words({ count: { min: 5, max: 200 } }),
        authorId: user.accountId,
        createdAt: dayjs()
          .subtract(Math.random() * 1000, 'hour')
          .toDate(),
      });
    }
    await prisma.post.createMany({
      data: posts,
    });
  });
  const posts = await prisma.post.findMany();
  posts.map(async (post) => {
    const comments = [];
    const reactions = [];
    const pivot = random(100);
    const randomNum =
      pivot < 33 ? random(5) : pivot < 66 ? random(2) : random(10);
    for (let i = 0; i < randomNum; i++) {
      const randomUser = users[random(users.length) - 1];
      if (randomUser) {
        comments.push({
          body: faker.word.words({ count: { min: 1, max: 10 } }),
          authorId: randomUser.accountId,
        });
        if (random(100) > 10) {
          reactions.push({
            type: ReactionType.LIKE,
            userId: randomUser.accountId,
          });
        }
      }
    }
    if (random(1) === 0 && comments.length && reactions.length) {
      console.log(comments, reactions);

      await prisma.post.update({
        where: { id: post.id },
        data: {
          comments: {
            createMany: {
              skipDuplicates: true,
              data:
                comments.length !== 0
                  ? comments
                  : [
                      {
                        body: 'Awesome!!',
                        authorId: basicUser.id,
                      },
                    ],
            },
          },
          reactions: {
            createMany: {
              skipDuplicates: true,
              data:
                reactions.length !== 0
                  ? reactions
                  : [
                      {
                        type: 'LIKE',
                        userId: basicUser.id,
                      },
                    ],
            },
          },
        },
      });
    }
  });
};

void seed();
