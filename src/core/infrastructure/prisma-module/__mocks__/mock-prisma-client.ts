export class PrismaClient {}

export class Prisma {
  static sql(strings: TemplateStringsArray[], ...values: any[]) {
    const strs = strings.map((str) => String(str));
    return `${String(strs)}${String(values)}`;
  }

  static raw(value: string) {
    return value;
  }
}
