import { Pool, QueryResult } from "pg";
import UserEntity from "../entities/UserEntity";
import { DBConfig } from "../types";

export default class DB {
  database: Pool;

  constructor(config: DBConfig) {
    this.database = new Pool(config);
  }

  async runQuery(
    query: string,
    values: (string | Date | boolean)[]
  ): Promise<QueryResult<UserEntity>> {
    const start = Date.now();
    const result = await this.database.query(query, values);
    const duration = Date.now() - start;
    console.log(`Query ${query} executed in ${duration / 1000}s.`);
    return result;
  }

  findOne(
    table: string,
    conditions: { [id: string]: string | Date }
  ): Promise<QueryResult<UserEntity>> {
    const query = `SELECT * FROM ${table} WHERE ${Object.keys(conditions)
      .map((condition, id) => `${condition}=$${id + 1}`)
      .join(" AND ")}`;
    const values = Object.values(conditions);
    return this.runQuery(query, values);
  }

  findAll(table: string): Promise<QueryResult<UserEntity>> {
    const query = `SELECT * FROM ${table}`;
    return this.runQuery(query, []);
  }

  insert(
    table: string,
    newObj: { [id: string]: string | Date }
  ): Promise<QueryResult<UserEntity>> {
    const query = `INSERT INTO ${table}(${Object.keys(newObj).join(
      ", "
    )}) VALUES (${Object.keys(newObj)
      .map((_, id) => `$${id + 1}`)
      .join(", ")}) RETURNING *`;
    const values = Object.values(newObj);
    return this.runQuery(query, values);
  }

  update(
    table: string,
    newObj: { [id: string]: string | Date | boolean },
    conditions: { [id: string]: string | Date }
  ): Promise<QueryResult<UserEntity>> {
    const query = `UPDATE ${table} SET ${Object.entries(newObj)
      .map((entry, id) => `${entry[0]}=$${id + 1}`)
      .join(", ")} WHERE ${Object.keys(conditions)
      .map(
        (condition, id) =>
          `${condition}=$${Object.values(newObj).length + id + 1}`
      )
      .join(" AND ")}`;
    const values = [...Object.values(newObj), ...Object.values(conditions)];
    return this.runQuery(query, values);
  }
}
