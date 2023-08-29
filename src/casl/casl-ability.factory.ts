import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PostDto } from 'src/models/dto/post.dto';
import { ProfileDto } from 'src/models/dto/profile.dto';
import { Action } from 'src/security/auth.enum';

type Subjects =
  | InferSubjects<typeof ProfileDto | typeof PostDto | Profile>
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: ProfileDto) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);
    if (user.role === 'ADMINISTRATOR') {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.Update, 'all', { authorId: user.id });
    cannot(Action.Delete, 'all');

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as unknown as ExtractSubjectType<Subjects>,
    });
  }
}
