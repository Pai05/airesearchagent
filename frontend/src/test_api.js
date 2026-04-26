import { searchPapers } from './api.js';

async function runTest() {
  try {
    const data = await searchPapers("machine learning", 5);
    const firstPaper = data.papers[0];
    
    console.log("total paper count:", data.total);
    if (!firstPaper) {
      console.log("No papers returned by backend for this query.");
      return;
    }

    console.log("first paper title:", firstPaper.title);
    console.log("first paper id:", firstPaper.id);
    console.log("first paper findings:", firstPaper.findings);
    console.log("first paper gaps:", firstPaper.gaps);
    console.log("first paper pdf_url:", firstPaper.pdf_url);
    console.log("first paper landing_url:", firstPaper.landing_url);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

runTest();
