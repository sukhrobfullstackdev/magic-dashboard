import type { CamelCase } from 'type-fest';

// for deeply converting object keys to camel case
export type CamelCaseObjectDeep<ObjectType> = ObjectType extends object
  ? {
      [Key in keyof ObjectType as CamelCase<Key>]: ObjectType[Key] extends object
        ? ObjectType[Key] extends Array<infer NestedArrayType>
          ? Array<CamelCaseObjectDeep<NestedArrayType>>
          : CamelCaseObjectDeep<ObjectType[Key]>
        : ObjectType[Key];
    }
  : ObjectType;
