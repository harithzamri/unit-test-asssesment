const axios = require("axios");
const { HttpFetcher, DataProcessor } = require("./index.js");

jest.mock("axios");

describe("HttpFetcher", () => {
  let fetcher;

  beforeEach(() => {
    fetcher = new HttpFetcher();
  });

  it("should fetch data successfully", async () => {
    const mockData = [
      { websiteId: 1, date: "2023-01-01", chats: 10, missedChats: 2 },
    ];
    axios.get.mockResolvedValue({ data: mockData });

    const data = await fetcher.fetchData("http://example.com/data");
    expect(data).toEqual(mockData);
  });

  it("should handle errors when fetching data", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    const data = await fetcher.fetchData("http://example.com/data");
    expect(data).toEqual([]);
  });
});

describe("DataProcessor", () => {
  const mockData = [
    { websiteId: 1, date: "2023-01-01", chats: 10, missedChats: 2 },
    { websiteId: 1, date: "2023-01-02", chats: 5, missedChats: 1 },
    { websiteId: 2, date: "2023-01-01", chats: 8, missedChats: 3 },
  ];

  it("should filter and aggregate data without date filtering", () => {
    const processor = new DataProcessor();
    const result = processor.filterAndAggregate(mockData);

    expect(result).toEqual([
      { websiteId: 1, totalChats: 15, totalMissedChats: 3 },
      { websiteId: 2, totalChats: 8, totalMissedChats: 3 },
    ]);
  });

  it("should filter and aggregate data with start date only", () => {
    const processor = new DataProcessor(new Date(2023, 0, 2));
    const result = processor.filterAndAggregate(mockData);

    expect(result).toEqual([
      { websiteId: 1, totalChats: 5, totalMissedChats: 1 },
    ]);
  });

  it("should filter and aggregate data with end date only", () => {
    const processor = new DataProcessor(null, new Date(2023, 0, 2));
    const result = processor.filterAndAggregate(mockData);

    expect(result).toEqual([
      { websiteId: 1, totalChats: 10, totalMissedChats: 2 },
      { websiteId: 2, totalChats: 8, totalMissedChats: 3 },
    ]);
  });

  it("should filter and aggregate data with both start and end dates", () => {
    const processor = new DataProcessor(
      new Date(2023, 0, 1),
      new Date(2023, 0, 2)
    );
    const result = processor.filterAndAggregate(mockData);

    expect(result).toEqual([
      { websiteId: 1, totalChats: 10, totalMissedChats: 2 },
      { websiteId: 2, totalChats: 8, totalMissedChats: 3 },
    ]);
  });

  it("should return an empty array if no data matches the date range", () => {
    const processor = new DataProcessor(
      new Date(2023, 0, 3),
      new Date(2023, 0, 4)
    );
    const result = processor.filterAndAggregate(mockData);

    expect(result).toEqual([]);
  });
});
