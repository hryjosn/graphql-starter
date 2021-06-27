import { prisma } from './db'
import { PrismaClient } from '@prisma/client'

export interface Context {
  prisma: PrismaClient
  req: any // HTTP request carrying the `Authorization` header
}

export function createContext(req: any) {
  return {
    ...req,
    prisma,
  }
}
