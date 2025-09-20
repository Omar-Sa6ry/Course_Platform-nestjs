import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  USER = 'user',
}
export const AllRoles: Role[] = Object.values(Role);

export enum Permission {
  // User
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  EDIT_USER_ROLE = 'edit_user_role',
  VIEW_USER = 'view_user',

  // Auth
  RESET_PASSWORD = 'RESET_PASSWORD',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  LOGOUT = 'LOGOUT',

  // Category
  CREATE_CATEGORY = 'create_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',

  // Course
  CREATE_COURSE = 'create_course',
  UPDATE_COURSE = 'update_course',
  DELETE_COURSE = 'delete_course',

  // Cart
  CREATE_CART = 'create_cart',
  UPDATE_CART = 'update_cart',
  DELETE_CART = 'delete_cart',
  VIEW_CART = 'view_cart',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL = 'all',
}

registerEnumType(Permission, {
  name: 'Permission',
  description: 'Detailed permissions in the system',
});

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
});

registerEnumType(CourseLevel, {
  name: 'CourseLevel',
  description: 'Detailed CourseLevel in the system',
});
