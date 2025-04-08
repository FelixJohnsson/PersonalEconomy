import { MongoDoc, WithClientId, WithMongoId } from "../types";

/**
 * Converts a MongoDB document to a client-side object
 * by replacing _id with id
 */
export function toClientModel<T extends { id: string }>(
  doc: WithMongoId<T>
): T {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
  } as unknown as T;
}

/**
 * Converts multiple MongoDB documents to client-side objects
 */
export function toClientModels<T extends { id: string }>(
  docs: WithMongoId<T>[]
): T[] {
  return docs.map(toClientModel);
}

/**
 * Converts a client-side object to a MongoDB document format
 * by replacing id with _id
 */
export function toMongoModel<T extends { id: string }>(
  clientObj: T
): WithMongoId<T> {
  const { id, ...rest } = clientObj;
  return {
    ...rest,
    _id: id,
  } as WithMongoId<T>;
}

/**
 * Prepares form data for MongoDB by removing id field
 * to be used when creating new documents
 */
export function prepareFormData<T extends { id?: string }>(
  formData: T
): Omit<T, "id"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = formData;
  return rest;
}
