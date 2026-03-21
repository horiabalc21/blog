import "reflect-metadata";
import { AppDataSource } from "../../ormconfig";

export const connectDB = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};
