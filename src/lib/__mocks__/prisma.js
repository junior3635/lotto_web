const mockPrisma = {
  country: {
    findUnique: jest.fn(),
  },
  state: {
    findFirst: jest.fn(),
  },
  draw: {
    findUnique: jest.fn(),
  },
};

export default mockPrisma;
