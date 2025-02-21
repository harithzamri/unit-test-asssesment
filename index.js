const axios = require("axios");

const URL =
  "https://bitbucket.org/!api/2.0/snippets/tawkto/aA8zqE/4f62624a75da6d1b8dd7f70e53af8d36a1603910/files/webstats.json";

class HttpFetcher {
  async fetchData(url) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return [];
    }
  }
}

class DataProcessor {
  constructor(startDate = null, endDate = null) {
    this.startDate = startDate instanceof Date ? startDate : null;
    this.endDate = endDate instanceof Date ? endDate : null;
    // this.startDate = startDate ? new Date(startDate) : null;
    // this.endDate = endDate ? new Date(endDate) : null;
  }

  filterAndAggregate(data) {
    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.date);

      const matchesStartDate = this.startDate
        ? itemDate >= this.startDate
        : true;
      const matchesEndDate = this.endDate ? itemDate <= this.endDate : true;

      return matchesStartDate && matchesEndDate;
    });

    return this.aggregateData(filteredData);
  }

  aggregateData(data) {
    const result = {};

    for (const item of data) {
      const { websiteId, chats, missedChats } = item;

      if (!result[websiteId]) {
        result[websiteId] = { websiteId, totalChats: 0, totalMissedChats: 0 };
      }

      result[websiteId].totalChats += chats;
      result[websiteId].totalMissedChats += missedChats;
    }

    return Object.values(result);
  }
}

module.exports = { HttpFetcher, DataProcessor };
